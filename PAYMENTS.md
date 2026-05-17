# 결제 (Toss Payments) 플로우

현재 코드 기준 결제 흐름과 구성 요소 정리. 추후 실제 토스 연동을 켤 때 이 문서를 참고.

---

## 1. 전체 흐름

```
[사용자] 상품 페이지에서 예약 신청
   └─ POST /api/v1/reservations            ReservationStatus = REQUESTED
[관리자] /admin/reservations 에서 "확정" 클릭
   └─ POST /api/v1/admin/reservations/{id}/confirm
                                           ReservationStatus = CONFIRMED
[사용자] /user/reservations 에서 "결제하기"
   └─ /user/reservations/{id}/checkout 진입
       └─ POST /api/v1/payments/prepare    (검증 + Toss 위젯용 메타 발급)
   └─ (현재: 모의 결제 버튼 / 실연동 시: Toss SDK 위젯 → 토스 결제창)
       │
       ├─ 성공 → /user/reservations/checkout/success?paymentKey=...&orderId=...&amount=...
       │   └─ POST /api/v1/payments/confirm
       │       (현재: payment.mock=true 면 Toss 호출 생략)
       │       (실연동: Toss /v1/payments/confirm 호출해 검증)
       │       → PaymentEntity 저장 + ReservationStatus = PAID
       │
       └─ 실패 → /user/reservations/checkout/fail?code=...&message=...&orderId=...
                 (예약 상태는 CONFIRMED 그대로)
[관리자] /admin/reservations 에서 해당 예약 "결제 완료" 배지 확인
```

---

## 2. 상태 머신

### `ReservationStatus`
`core/persistence/entity/ReservationStatus.kt`

```
REQUESTED → CONFIRMED → PAID → COMPLETED
                ↓        ↓
              CANCELLED CANCELLED
```

- `REQUESTED` → `CONFIRMED`: 관리자가 `confirmReservation` 호출
- `CONFIRMED` → `PAID`: 사용자 결제 승인 (`PaymentService.confirmPayment`)
- `PAID` → `COMPLETED`: 픽업 완료 (현재 코드에서는 명시 액션 없음, 추후 픽업 처리 시)
- `CANCELLED`: 별도 취소 흐름 (현재 미구현)

### `PaymentStatus`
`core/persistence/entity/PaymentStatus.kt`

```
PENDING  — 사전 준비 단계 (현재 PaymentEntity 는 PAID 로 바로 생성됨)
PAID     — confirmPayment 성공 시
REFUNDED — 환불 (현재 미구현)
FAILED   — 결제 실패 (현재 미구현, fail 페이지는 confirm 호출 없이 종료)
```

---

## 3. 백엔드

### 3.1 컨트롤러
`service_api/reservation/presentation/PaymentController.kt`

| 메서드 | URL | 역할 |
|---|---|---|
| `preparePayment` | `POST /api/v1/payments/prepare` | 결제 시작 — 검증 + 토스 위젯용 메타 |
| `confirmPayment` | `POST /api/v1/payments/confirm` | 토스 결제 승인 콜백 후 호출 |
| `getMyPayments` | `GET /api/v1/payments/my` | 내 결제 내역 조회 |

요청 DTO
```
PaymentPrepareRequest  { reservationId: Long }
PaymentConfirmRequest  { paymentKey: String, orderId: String, amount: Long }
```

응답 DTO
```
PaymentPrepareResponse {
  clientKey, customerKey, orderId, amount,
  orderName, customerName, successUrl, failUrl
}
PaymentResponse {
  id, reservationId, amount, status, paidAt,
  paymentKey, orderId, createdAt
}
```

### 3.2 서비스
`service_api/reservation/application/PaymentService.kt`

#### `preparePayment(userId, reservationId)` `@Transactional(readOnly = true)`
1. `reservationRepository.findById` 로 예약 조회 → 없으면 `RESERVATION_NOT_FOUND`
2. `reservation.userId != userId` → `RESERVATION_FORBIDDEN`
3. `reservation.status != CONFIRMED` → `INVALID_RESERVATION_STATUS` ("확정된 예약만 결제 가능")
4. 이미 결제 row 가 있으면 `INVALID_RESERVATION_STATUS` ("이미 결제된 예약")
5. `PaymentPrepareResponse` 반환:
   - `clientKey` = `${toss.client-key}` (프론트가 Toss SDK 초기화에 사용)
   - `customerKey` = `"user-$userId"` (토스 비회원 결제용 식별자)
   - `orderId` = `reservation.reservationNumber` (UUID-like)
   - `amount` = `reservation.totalPrice`
   - `orderName` = `"<상품명>"` (수량 > 1 이면 `"<상품명> 외 N건"`)
   - `customerName` = 사용자 nickname
   - `successUrl` / `failUrl` = 설정값 (Toss 리다이렉트 대상)

#### `confirmPayment(userId, paymentKey, orderId, amount)` `@Transactional`
1. `orderId` 로 예약 찾기 (현재는 `findAll().firstOrNull { it.reservationNumber == orderId }` — 개선 여지 있음, `findByReservationNumber` 권장)
2. 소유권/CONFIRMED 상태/금액 일치/중복 결제 검증 (`preparePayment` 와 동일 룰)
3. **Toss 호출 (mock 모드면 스킵)**:
   ```kotlin
   if (!paymentMock) {
       val tossResponse = tossPaymentsClient.confirmPayment(paymentKey, orderId, amount)
       if (tossResponse.status != "DONE") throw PAYMENT_VERIFICATION_FAILED
   }
   ```
4. `PaymentEntity` 저장 (`status = PAID`, `paidAt = now`, `paymentKey/orderId` 는 요청 값 그대로)
5. `reservation.status = PAID` (JPA dirty checking 으로 UPDATE)
6. `PaymentResponse` 반환

#### `getMyPayments(userId)` `@Transactional(readOnly = true)`
`paymentRepository.findAllByUserIdOrderByCreatedAtDesc(userId)`

### 3.3 Toss HTTP 클라이언트
`core/client/toss/TossPaymentsClient.kt`

```kotlin
fun confirmPayment(paymentKey, orderId, amount): TossPaymentResponse
```

- `RestClient` 빈은 `core/config/TossPaymentsConfig.kt` 에서 `baseUrl = "https://api.tosspayments.com"` 로 생성
- 인증: `Authorization: Basic Base64("${secretKey}:")` — secretKey 뒤에 콜론 필수
- 엔드포인트: `POST /v1/payments/confirm`
- 본문: `TossConfirmRequest(paymentKey, orderId, amount)`
- 응답: `TossPaymentResponse(paymentKey, orderId, orderName, status, totalAmount, method, approvedAt)`
- 4xx/5xx → `RestClientResponseException` 캐치 → `PAYMENT_VERIFICATION_FAILED` 던짐
- 성공 status 값: `"DONE"` 일 때만 통과

### 3.4 엔티티 / Repository
`core/persistence/entity/PaymentEntity.kt`

```
PaymentEntity {
  id: Long
  reservationId: Long  (UNIQUE — 1 예약 = 1 결제)
  userId: Long
  amount: Long
  status: PaymentStatus
  paidAt: LocalDateTime?
  paymentKey: String?  (UNIQUE)
  orderId: String?
  + BaseEntity (createdAt, updatedAt)
}
```

`core/persistence/repository/PaymentRepository.kt`
- `findAllByUserIdOrderByCreatedAtDesc(userId)`
- `findByReservationId(reservationId)`

### 3.5 ErrorCode (1600 ~ 1699)
`core/exception/ErrorCode.kt`

| 코드 | 이름 | 의미 |
|---|---|---|
| 1600 | `PAYMENT_NOT_FOUND` | 결제 내역 없음 |
| 1601 | `PAYMENT_VERIFICATION_FAILED` | 토스 검증 실패 / status != DONE / 응답 비어있음 |
| 1602 | `PAYMENT_AMOUNT_MISMATCH` | 요청 amount 와 예약 totalPrice 불일치 |

### 3.6 트랜잭션 경계
`confirmPayment` 는 `@Transactional` — Toss 외부 호출이 **트랜잭션 내부**에서 일어남. Toss 실패 시 자동 롤백되어 PaymentEntity 가 생성되지 않음. 외부 호출이 길어지면 DB 커넥션이 묶이는 트레이드오프는 있으나, 결제 일관성이 우선이라 그대로 둠.

---

## 4. 프론트엔드

### 4.1 페이지
| 경로 | 파일 | 역할 |
|---|---|---|
| `/user/reservations` | `app/user/reservations/page.tsx` | 내 예약 목록. `CONFIRMED` 상태에 "결제하기" 버튼 |
| `/user/reservations/[id]/checkout` | `app/user/reservations/[id]/checkout/page.tsx` | **현재: 모의 결제 UI**. 실연동 시 Toss SDK 위젯 |
| `/user/reservations/checkout/success` | `app/user/reservations/checkout/success/page.tsx` | Toss success 콜백 — 쿼리 `paymentKey/orderId/amount` 를 받아 `confirmPayment` 호출 |
| `/user/reservations/checkout/fail` | `app/user/reservations/checkout/fail/page.tsx` | Toss fail 콜백 — 쿼리 `code/message/orderId` 표시 |
| `/admin/reservations` | `app/admin/reservations/page.tsx` | 관리자 예약 관리. `PAID` 배지 노출 |

### 4.2 API 클라이언트
`src/api/payment.api.ts`

```ts
preparePayment(reservationId): Promise<PaymentPrepareResponse>
confirmPayment({ paymentKey, orderId, amount }): Promise<Payment>
getMyPayments(): Promise<Payment[]>
```

### 4.3 Toss SDK
- 패키지: `@tosspayments/tosspayments-sdk` (package.json 에 이미 설치됨, 버전 `^2.7.0`)
- 사용 위치: 현재 import 제거됨 (`[id]/checkout/page.tsx` 가 모의 UI). 실연동 시 이 파일에서 다시 사용.
- 호출 흐름 (실연동 시):
  ```ts
  const tossPayments = await loadTossPayments(prepare.clientKey);
  const widgets = tossPayments.widgets({ customerKey: prepare.customerKey });
  await widgets.setAmount({ currency: "KRW", value: prepare.amount });
  await widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" });
  await widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" });
  // 결제 버튼 클릭 시
  await widgets.requestPayment({
    orderId: prepare.orderId,
    orderName: prepare.orderName,
    customerName: prepare.customerName,
    successUrl: prepare.successUrl,    // Toss 가 결제 성공 시 리다이렉트
    failUrl: prepare.failUrl,
  });
  ```
- Toss SDK 가 successUrl 에 `paymentKey`, `orderId`, `amount` 쿼리를 자동으로 붙여 리다이렉트한다. success 페이지가 그 값을 그대로 `confirmPayment` 로 전달.

---

## 5. 설정 / 환경변수

`backend/src/main/resources/application-local.yaml`

```yaml
toss:
  client-key: ${TOSS_CLIENT_KEY:test_ck_docs_Ovk5rk1EwkEbP0W43n07xlzm}
  secret-key: ${TOSS_SECRET_KEY:test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R}

payment:
  success-url: ${PAYMENT_SUCCESS_URL:http://localhost:3000/user/reservations/checkout/success}
  fail-url: ${PAYMENT_FAIL_URL:http://localhost:3000/user/reservations/checkout/fail}
  mock: ${PAYMENT_MOCK:true}
```

| 키 | 의미 | 기본값 |
|---|---|---|
| `toss.client-key` | 프론트 SDK 초기화 키. `preparePayment` 응답에 포함. | 토스 데모 키 |
| `toss.secret-key` | 백엔드가 `/v1/payments/confirm` 호출 시 Basic Auth 에 사용 | 토스 데모 키 |
| `payment.success-url` | Toss 리다이렉트 대상 (성공) | `http://localhost:3000/...` |
| `payment.fail-url` | Toss 리다이렉트 대상 (실패) | `http://localhost:3000/...` |
| `payment.mock` | **true 면 Toss 호출 스킵하고 흐름만 진행** | `true` |

---

## 6. 현재 mock 모드 동작

`payment.mock=true` (기본값) 일 때:

- 프론트 `[id]/checkout/page.tsx` 는 Toss SDK 위젯 대신 "결제 성공" / "결제 실패" 버튼만 노출.
- "결제 성공" 클릭 시 `paymentKey=mock_<timestamp>_<rnd>` 를 직접 만들어 success 페이지로 이동.
- success 페이지가 평소대로 `confirmPayment` 호출.
- 백엔드는 `if (!paymentMock)` 분기로 Toss 호출을 스킵하고 그대로 PAID 처리.
- **비즈니스 검증(소유권/상태/금액/중복)은 mock 모드여도 그대로 동작** — 잘못된 호출은 그대로 막힘.

---

## 7. 실 Toss 연동 전환 시 체크리스트

순서대로 확인:

1. **토스 가맹점 키 발급 후 환경변수 설정**
   ```
   export TOSS_CLIENT_KEY=live_ck_...
   export TOSS_SECRET_KEY=live_sk_...
   ```
   (테스트 키는 위 yaml 의 기본값이 `test_ck_docs_*` / `test_sk_zXLk...`)

2. **mock 모드 끄기**
   ```
   export PAYMENT_MOCK=false
   ```
   또는 yaml 의 `payment.mock` 기본값을 `false` 로 변경.

3. **프론트 checkout 페이지 복구**: `frontend/src/app/user/reservations/[id]/checkout/page.tsx` 에 Toss SDK 위젯 코드 복원 (위 4.3 의 코드 참고). 현재 시뮬레이션 버튼 두 개는 제거.

4. **successUrl / failUrl 점검**: 프로덕션 도메인으로 환경변수 `PAYMENT_SUCCESS_URL`, `PAYMENT_FAIL_URL` 지정. 토스 콘솔의 "리다이렉트 허용 URL" 에도 동일 등록 필요.

5. **결제 위젯 variantKey 확인**: 가맹점 설정에 따라 `renderPaymentMethods({ variantKey })`, `renderAgreement({ variantKey })` 의 키가 다를 수 있음. 토스 가맹점 콘솔에서 위젯 키 확인.

6. **금액 변조 방지 점검**: `confirmPayment` 가 `amount != reservation.totalPrice` 면 `PAYMENT_AMOUNT_MISMATCH` 던지는지 회귀 테스트. 클라가 amount 를 조작해도 서버가 막아야 함.

7. **트랜잭션 타임아웃 검토**: Toss 호출이 트랜잭션 안에 있어 외부 응답이 느리면 DB 커넥션 점유 시간이 길어짐. 필요 시:
   - `RestClient` 에 read/connect timeout 설정 (`TossPaymentsConfig.kt` 에서 `ClientHttpRequestFactory` 주입)
   - 또는 결제 단계만 트랜잭션 분리 (Toss 호출 → 트랜잭션 시작 → 저장 패턴). 단, 이 경우 idempotency 처리 필요.

8. **idempotency / 재시도**:
   - 토스는 같은 `paymentKey` 로 confirm 재호출 시 동일 응답을 돌려줌 (멱등).
   - 현재 코드는 PaymentEntity 의 `reservationId` UNIQUE + 중복 결제 사전 체크로 더블 charge 차단. 동시 호출 시 race condition 검토 필요 (DB unique 위반 시 `Conflict` 던지도록 보강 권장).

9. **로그 / 모니터링**:
   - 성공: `Toss confirm OK paymentKey=... orderId=... amount=...`
   - 실패: `TossPaymentsClient` 에 이미 `log.warn { ... }` 가 있음. APM/알람 연결.

10. **결제 취소 / 환불**: 현재 미구현. Toss `POST /v1/payments/{paymentKey}/cancel` 을 호출하는 `cancelPayment` 메서드 + `PaymentStatus.REFUNDED` 전이 + `ReservationStatus.CANCELLED` 전이 추가 필요.

11. **CANCELLED 전이 / 픽업 완료**: 결제 외 다른 상태 전이도 정리 필요 (`PAID → COMPLETED` 액션, `CONFIRMED → CANCELLED` 어드민 액션 등).

---

## 8. 관련 파일 한눈에

**Backend**
- `service_api/reservation/presentation/PaymentController.kt`
- `service_api/reservation/presentation/PaymentPrepareRequest.kt` / `PaymentPrepareResponse.kt`
- `service_api/reservation/presentation/PaymentConfirmRequest.kt` / `PaymentResponse.kt`
- `service_api/reservation/application/PaymentService.kt`
- `core/client/toss/TossPaymentsClient.kt`
- `core/client/toss/TossDto.kt`
- `core/config/TossPaymentsConfig.kt`
- `core/persistence/entity/PaymentEntity.kt` / `PaymentStatus.kt`
- `core/persistence/entity/ReservationStatus.kt`
- `core/persistence/repository/PaymentRepository.kt`
- `core/exception/ErrorCode.kt` (1600~1699)
- `application-local.yaml` (`toss.*`, `payment.*`)

**Frontend**
- `src/api/payment.api.ts`
- `src/app/user/reservations/page.tsx`
- `src/app/user/reservations/[id]/checkout/page.tsx`
- `src/app/user/reservations/checkout/success/page.tsx`
- `src/app/user/reservations/checkout/fail/page.tsx`
- `src/app/admin/reservations/page.tsx`
- `package.json` (`@tosspayments/tosspayments-sdk`)

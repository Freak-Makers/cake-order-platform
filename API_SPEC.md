# Cake Order Platform API Specification

이 문서는 케이크 주문 플랫폼의 프론트엔드와 백엔드 간 통신을 위한 API 명세서입니다.

## 1. 공통 사항

### 1.1 기본 정보
- **Base URL**: `http://localhost:8080` (개발 환경)
- **Content-Type**: `application/json`
- **인증 방식**: HTTP Bearer Header (`Authorization: Bearer {accessToken}`)

### 1.2 공통 응답 구조 (SuccessResponse)
모든 성공 응답은 아래와 같은 공통 구조를 가집니다.

```json
{
  "code": 200,
  "message": "성공",
  "data": { ... }
}
```

---

## 2. 인증 관련 API (Authentication)

### 2.1 관리자 로그인 (사장님 체험)
관리자 전용 대시보드 접근을 위한 이메일/비밀번호 기반 로그인입니다.

- **Method**: `POST`
- **URL**: `/api/v1/admin/users/login`
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123"
  }
  ```
- **Response Data**:
  ```json
  {
    "id": 1,
    "nickname": "사장님",
    "email": "admin@example.com",
    "accessToken": "ey..."
  }
  ```

### 2.2 카카오 로그인 (사용자 체험)
사용자 전용 상품 주문 페이지 접근을 위한 소셜 로그인입니다.

- **Method**: `GET`
- **URL**: `/api/v1/users/login/kakao`
- **Query Parameters**:
  - `code`: 카카오 인가 코드 (필수)
- **Response Data**:
  ```json
  {
    "id": 1,
    "nickname": "홍길동",
    "email": "user@kakao.com",
    "profileImageUrl": "https://...",
    "accessToken": "ey..."
  }
  ```

---

## 3. 상품 관련 API (Product)

### 3.1 상품 목록 조회 (사용자, 커서 페이지네이션)
사용자 사이트 전용. 커서 기반 무한 스크롤 — 첫 호출은 cursor 없이, 이후 응답의 `nextCursor` 를 그대로 다시 전달.

- **Method**: `GET`
- **URL**: `/api/v1/products?cursor={opaque}&limit=20&category={category}&sort=latest`
- **Query**:
  - `cursor` *(optional, opaque base64)* — 첫 페이지면 미전달
  - `limit` *(default 20, 1~50 자동 보정)*
  - `category` *(optional)* — `"전체"` 의미면 미전달
  - `sort` *(default `latest`)* — `latest` | `priceAsc` | `priceDesc`
- **Header** (선택): `Authorization: Bearer {accessToken}` — 로그인 상태로 호출 시 `isLiked` 가 사용자별 값으로 채워짐. 미로그인이면 모두 `false`.
- **Response Data**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "name": "생딸기 생크림 케이크",
        "description": "국산 설향 딸기가 듬뿍 들어간 케이크",
        "category": "홀케이크",
        "price": 45000,
        "imageUrl": "https://...",
        "status": "AVAILABLE",
        "likeCount": 12,
        "isLiked": false,
        "createdAt": "2024-05-17T10:00:00Z",
        "updatedAt": "2024-05-17T10:00:00Z"
      }
    ],
    "nextCursor": "eyJzb3J0IjoiTEFURVNUIiwibGFzdFZhbHVlIjoiMjAyNi0wNS0xN1QxMDowMDowMCIsImxhc3RJZCI6MX0",
    "hasNext": true
  }
  ```
  - **Product Status**: `AVAILABLE`, `SOLD_OUT`, `HIDDEN`
  - `nextCursor` 는 `hasNext=false` 면 `null`.
  - **에러**: cursor 디코드 실패 → `400 PRODUCT_INVALID_CURSOR(1701)`. cursor 의 sort 와 query 의 sort 가 다르면 동일 에러.
  - 정렬/카테고리를 바꾸면 클라이언트는 cursor 를 리셋하고 첫 페이지부터 재요청해야 한다.

### 3.1b 상품 카테고리 목록
사용자 사이트의 필터 옵션 소스. 인증 불필요.

- **Method**: `GET`
- **URL**: `/api/v1/products/categories`
- **Response Data**:
  ```json
  ["시즌 한정", "치즈케이크", "홀케이크"]
  ```

### 3.2 상품 등록 (관리자)
새로운 케이크 상품을 등록합니다.

- **Method**: `POST`
- **URL**: `/api/v1/admin/products`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "name": "신메뉴 케이크",
    "description": "상세 설명",
    "category": "시즌 한정",
    "price": 42000,
    "imageUrl": "https://..."
  }
  ```
- **Response Data**: 생성된 상품 객체 반환

### 3.3 상품 목록 조회 (관리자, 페이지네이션)
관리자 콘솔 전용. offset 기반 페이지네이션, 최신순(`createdAt desc`).

- **Method**: `GET`
- **URL**: `/api/v1/admin/products?offset=0&limit=20`
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Query**:
  - `offset` (default 0) — 0-based, `limit` 의 배수를 권장. 배수가 아니면 `(offset/limit)*limit` 로 자동 보정.
  - `limit` (default 20, 범위 1~100, 초과 시 자동 보정)
- **Response Data**:
  ```json
  {
    "items": [ /* 3.1 단건 형식 */ ],
    "total": 137,
    "offset": 0,
    "limit": 20
  }
  ```
- 클라이언트는 `hasNext = offset + items.length < total` 로 다음 페이지 존재 여부 판단.

### 3.4 상품 수정 (관리자)
기존 상품의 일부 필드를 변경합니다. **보낸 필드만 갱신**되고, 누락된 필드는 그대로 유지됩니다.

- **Method**: `PUT`
- **URL**: `/api/v1/admin/products/{id}`
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Request Body** (모든 필드 optional):
  ```json
  {
    "name": "신메뉴 케이크 (리뉴얼)",
    "description": "상세 설명",
    "category": "시즌 한정",
    "price": 45000,
    "imageUrl": "https://...",
    "status": "AVAILABLE"
  }
  ```
- **Response Data**: 갱신된 상품 객체 (3.1 단건 형식)
- **에러**: 상품 없음 → 404 `PRODUCT_NOT_FOUND(1700)`

### 3.5 상품 삭제 (관리자)
- **Method**: `DELETE`
- **URL**: `/api/v1/admin/products/{id}`
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Response Data**: 비어있음
- **에러**: 상품 없음 → 404 `PRODUCT_NOT_FOUND(1700)`
- **삭제 방식**: soft delete (`deleted_at` 컬럼에 시각 기록, 이후 모든 조회에서 자동 제외).
- **주의**: 이번 단계에서는 연관 예약·결제의 cascade 처리를 하지 않습니다 (orphan 가능). 향후 보강 예정.

### 3.6 상품 단건 조회 (사용자, 공개)
상품 상세 페이지 진입 시 호출. 인증 불필요. 로그인 토큰이 있으면 `isLiked` 가 사용자별 값으로 채워짐.

- **Method**: `GET`
- **URL**: `/api/v1/products/{id}`
- **Header** (선택): `Authorization: Bearer {accessToken}`
- **Response Data**: 3.1 단건 형식 (`likeCount`, `isLiked` 포함)
- **에러**: 상품 없음 → 404 `PRODUCT_NOT_FOUND(1700)`

### 3.7 상품 좋아요 토글
사용자 좋아요 추가/취소를 한 endpoint 에서 처리. 멱등 X — 호출할 때마다 상태 반전.

- **Method**: `POST`
- **URL**: `/api/v1/products/{id}/like`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**: 비어있음
- **에러**: 상품 없음 → 404 `PRODUCT_NOT_FOUND(1700)`
- **동작**: `ProductLikeEntity` 가 없으면 INSERT + `products.like_count += 1`, 있으면 DELETE + `like_count -= 1` (0 미만 보정).

---

## 4. 예약 관련 API (Reservation)

PRD 의 "예약" 도메인. 흐름: **유저 신청 → 관리자 확정 → 유저 결제**.

### 4.1 예약 가능 슬롯 목록 (공개)
사장님이 등록한 예약 가능 시간대 목록입니다. **과거 시각이거나 이미 다른 예약이 잡힌 슬롯은 응답에서 자동 제외**됩니다. 슬롯 단위는 `(날짜, 시간)` 페어이며 한 슬롯당 예약 1건만 허용됩니다.

- **Method**: `GET`
- **URL**: `/api/v1/reservation-slots`
- **Response Data**:
  ```json
  [
    { "id": 1, "startAt": "2026-06-01T10:00:00" },
    { "id": 2, "startAt": "2026-06-01T14:00:00" }
  ]
  ```

### 4.2 예약 신청 (사용자)
사용자가 슬롯을 골라 상품을 예약합니다. 상태는 `REQUESTED` 로 생성됩니다.

- **Method**: `POST`
- **URL**: `/api/v1/reservations`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "productId": 1,
    "slotId": 1,
    "quantity": 1,
    "requirements": "레터링 문구: 생일 축하해"
  }
  ```
- **Response Data**:
  ```json
  {
    "id": 10,
    "reservationNumber": "RES-20240517-abc12345",
    "productId": 1,
    "productName": "생딸기 생크림 케이크",
    "slotId": 1,
    "slotStartAt": "2026-06-01T10:00:00",
    "quantity": 1,
    "totalPrice": 45000,
    "requirements": "레터링 문구: 생일 축하해",
    "status": "REQUESTED",
    "createdAt": "2024-05-17T11:00:00Z"
  }
  ```
- **에러**: 슬롯이 이미 다른 예약에 점유됨(409, `RESERVATION_SLOT_TAKEN`).

### 4.3 내 예약 내역 (사용자)
- **Method**: `GET`
- **URL**: `/api/v1/reservations/my`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**: 4.2 의 객체 배열
- **Reservation Status**: `REQUESTED` → `CONFIRMED` → `PAID` → `COMPLETED` / `CANCELLED`

### 4.4 슬롯 관리 (관리자)
- `GET    /api/v1/admin/reservation-slots` — 전체 슬롯 조회 (`startAt asc`)
- `POST   /api/v1/admin/reservation-slots` — **한 날짜에 여러 시간 일괄 등록.**
  - Body: `{ "date": "2026-06-01", "times": ["10:00", "14:00", "18:00"] }`
  - 응답: 신규 생성된 슬롯 배열 `[{ "id": 1, "startAt": "2026-06-01T10:00:00" }, ...]`. 이미 등록된 시간은 조용히 skip 되어 응답에 포함되지 않음.
- `DELETE /api/v1/admin/reservation-slots/{id}` — 슬롯 단건 삭제 (soft delete, `deleted_at` 채워지고 조회·중복검사에서 자동 제외)
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)

### 4.5 전체 예약 조회 + 확정 (관리자)

#### 4.5.1 예약 목록 (페이지네이션 + 필터)
- **Method**: `GET`
- **URL**: `/api/v1/admin/reservations?offset=0&limit=20&status=CONFIRMED&keyword=RES-2026`
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Query**
  - `offset` (default 0, limit 의 배수 권장), `limit` (default 20, 1~100 자동 보정)
  - `status` (optional, `REQUESTED|CONFIRMED|PAID|COMPLETED|CANCELLED`)
  - `keyword` (optional, `reservationNumber` 부분일치, 대소문자 무시)
- **Response Data**:
  ```json
  {
    "items": [ /* 4.2 형식 + customerName */ ],
    "total": 137,
    "offset": 0,
    "limit": 20
  }
  ```
- 정렬: `createdAt desc`

#### 4.5.2 예약 확정
- `POST /api/v1/admin/reservations/{id}/confirm` — `REQUESTED` → `CONFIRMED`. 다른 상태에서는 400.
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)

#### 4.5.3 예약 취소 (관리자)
- `POST /api/v1/admin/reservations/{id}/cancel` — 모든 상태에서 `CANCELLED` 로 전이.
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Response Data**: 갱신된 AdminReservation
- **에러**: 예약 없음(404, `RESERVATION_NOT_FOUND`), 이미 취소됨(400, `INVALID_RESERVATION_STATUS`)
- **주의**: `PAID` 상태인 예약을 관리자가 취소해도 PaymentEntity 는 그대로 — 환불은 별도 처리.

### 4.6 예약 취소 (사용자)
본인 예약 취소. `REQUESTED` 또는 `CONFIRMED` 만 가능 (PAID 이후는 환불 흐름이 별도라 차단).

- **Method**: `POST`
- **URL**: `/api/v1/reservations/{id}/cancel`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**: 갱신된 Reservation (`status: "CANCELLED"`)
- **에러**:
  - 예약 없음 → 404 `RESERVATION_NOT_FOUND(1500)`
  - 본인 예약 아님 → 403 `RESERVATION_FORBIDDEN(1503)`
  - `PAID`/`COMPLETED`/이미 `CANCELLED` 인 경우 → 400 `INVALID_RESERVATION_STATUS(1502)`
- **부수 효과**: `status = CANCELLED` 가 되면 `takenSlotIds()` 에서 자동 제외돼 해당 슬롯이 다시 예약 가능해짐.

---

## 5. 후기 관련 API (Review)

### 5.1 상품별 후기 목록 조회
특정 상품에 등록된 후기 목록을 조회합니다.

- **Method**: `GET`
- **URL**: `/api/v1/products/{productId}/reviews`
- **Response Data**:
  ```json
  [
    {
      "id": 1,
      "productId": 1,
      "authorName": "홍길동",
      "authorProfileImageUrl": "https://...",
      "content": "정말 맛있어요! 디자인도 예쁩니다.",
      "rating": 5,
      "likeCount": 12,
      "isLiked": false,
      "createdAt": "2024-05-17T15:00:00Z"
    }
  ]
  ```

### 5.2 후기 등록
상품에 대한 후기를 작성합니다.

- **Method**: `POST`
- **URL**: `/api/v1/products/{productId}/reviews`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "content": "최고의 케이크입니다!",
    "rating": 5
  }
  ```
- **Response Data**: 생성된 후기 객체 반환

### 5.3 후기 좋아요 토글
후기에 좋아요를 누르거나 취소합니다.

- **Method**: `POST`
- **URL**: `/api/v1/reviews/{id}/like`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**: 비어있음

---

## 6. 게시글 관련 API (Post)

홍보 게시글 도메인. 관리자는 등록/수정/삭제, 유저는 조회/좋아요/댓글이 가능합니다. **삭제는 soft delete** 로 처리되며(`deleted_at` 컬럼에 시각 기록), 이후 모든 조회에서 자동 제외됩니다. 모든 목록 조회는 **공지(`isNotice=true`) 먼저, 그 다음 최신순(`createdAt desc`)** 으로 정렬됩니다.

### 6.1 게시글 목록 조회 (페이지네이션 + 키워드 필터)
정렬 규칙(공지 먼저 → 최신순)대로 조회합니다. 비로그인 사용자도 호출 가능합니다. (soft-deleted 게시글 자동 제외)

- **Method**: `GET`
- **URL**: `/api/v1/posts?offset=0&limit=20&keyword=케이크`
- **Header**: `Authorization: Bearer {accessToken}` (선택 — 있으면 응답의 `isLiked` 가 사용자 기준으로 계산됨)
- **Query**:
  - `offset` (default 0, limit 의 배수 권장), `limit` (default 20, 1~100 자동 보정)
  - `keyword` (optional, 제목 부분일치 / 대소문자 무시)
- **Response Data**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "productId": 3,
        "title": "신메뉴 출시! 망고 쇼트 케이크",
        "content": "여름 시즌 한정으로 망고 쇼트 케이크가 새로 나왔습니다.",
        "imageUrl": "https://...",
        "viewCount": 128,
        "likeCount": 12,
        "isLiked": false,
        "isNotice": false,
        "createdAt": "2024-05-17T15:00:00Z"
      }
    ],
    "total": 137,
    "offset": 0,
    "limit": 20
  }
  ```
  - `productId` 는 게시글이 특정 상품과 연결될 때만 값이 있고, 일반 공지/홍보글에서는 `null`.
  - `isNotice` 가 `true` 인 게시글은 응답 상단에 노출됩니다 (페이지 1).

### 6.2 게시글 상세 조회
게시글 본문을 조회합니다. **호출 시 `viewCount` 가 1 증가합니다.**

- **Method**: `GET`
- **URL**: `/api/v1/posts/{id}`
- **Header**: `Authorization: Bearer {accessToken}` (선택)
- **Response Data**: 6.1 의 단일 객체와 동일

### 6.3 게시글 등록 (관리자)
- **Method**: `POST`
- **URL**: `/api/v1/admin/posts`
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Request Body**:
  ```json
  {
    "title": "신메뉴 출시! 망고 쇼트 케이크",
    "content": "여름 시즌 한정으로...",
    "productId": 3,
    "imageUrl": "https://...",
    "isNotice": false
  }
  ```
  - `productId`, `imageUrl`, `isNotice` 는 선택. `isNotice` 미지정 시 `false`.
- **Response Data**:
  ```json
  {
    "id": 1,
    "productId": 3,
    "title": "...",
    "content": "...",
    "imageUrl": "https://...",
    "viewCount": 0,
    "likeCount": 0,
    "isNotice": false,
    "createdAt": "2024-05-17T15:00:00Z"
  }
  ```

### 6.3b 관리자 게시글 목록 (페이지네이션)
- **Method**: `GET`
- **URL**: `/api/v1/admin/posts?offset=0&limit=20`
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Query**: `offset` (default 0, limit 의 배수 권장), `limit` (default 20, 1~100 자동 보정)
- **Response Data**:
  ```json
  {
    "items": [ /* 6.3 단건 형식 */ ],
    "total": 137,
    "offset": 0,
    "limit": 20
  }
  ```
- 정렬: 공지 먼저 → 최신순. soft-deleted 자동 제외.

### 6.4 게시글 수정 (관리자)
기존 게시글의 일부 필드를 변경합니다. **보낸 필드만 갱신**되고, 누락된 필드는 그대로 유지됩니다.

- **Method**: `PUT`
- **URL**: `/api/v1/admin/posts/{id}`
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Request Body** (모든 필드 optional):
  ```json
  {
    "title": "신메뉴 (리뉴얼)",
    "content": "변경된 본문",
    "productId": 3,
    "imageUrl": "https://...",
    "isNotice": true
  }
  ```
- **Response Data**: 6.3 의 단건 형식
- **에러**: 게시글 없음 → 404 `ARTICLE_NOT_FOUND(1100)`

### 6.5 게시글 삭제 (관리자)
연결된 댓글은 함께 soft delete, 좋아요는 hard delete 됩니다. **본 게시글 row 는 `deleted_at` 만 채워진 채 DB 에 남으며 이후 조회에서 자동 제외됩니다.**

- **Method**: `DELETE`
- **URL**: `/api/v1/admin/posts/{id}`
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Response Data**: 비어있음

### 6.6 게시글 좋아요 토글
- **Method**: `POST`
- **URL**: `/api/v1/posts/{id}/like`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**: 비어있음

### 6.7 댓글 목록 조회 (페이지네이션)
- **Method**: `GET`
- **URL**: `/api/v1/posts/{postId}/comments?offset=0&limit=5`
- **Header** (선택): `Authorization: Bearer {accessToken}` — 로그인 상태로 호출 시 각 댓글의 `isMine` 이 사용자별 값으로 채워짐. 미로그인이면 모두 `false`.
- **Query**:
  - `offset` (default 0, limit 의 배수 권장), `limit` (default 5, 1~100 자동 보정)
- **Response Data**:
  ```json
  {
    "items": [
      {
        "id": 10,
        "postId": 1,
        "authorName": "홍길동",
        "authorProfileImageUrl": "https://...",
        "content": "꼭 먹어보고 싶네요!",
        "isMine": false,
        "createdAt": "2024-05-17T16:00:00Z"
      }
    ],
    "total": 8,
    "offset": 0,
    "limit": 5
  }
  ```
  - 정렬: `createdAt desc` (최신 댓글이 위)
  - soft-deleted 댓글은 자동 제외 (`CommentEntity` `@SQLRestriction`)
  - `isMine`: 호출자가 작성자인 경우 true. 프론트의 수정/삭제 버튼 노출 판단용.

### 6.8 댓글 작성
- **Method**: `POST`
- **URL**: `/api/v1/posts/{postId}/comments`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "content": "꼭 먹어보고 싶네요!"
  }
  ```
- **Response Data**: 6.7 응답 `items` 의 단일 객체와 동일 (작성자 본인 호출이므로 `isMine: true`)

### 6.9 댓글 수정
본인이 작성한 댓글만 수정 가능. URL 의 `postId` 는 식별용 (서비스는 `commentId` 기준 작성자 검증).

- **Method**: `PUT`
- **URL**: `/api/v1/posts/{postId}/comments/{commentId}`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "content": "수정된 댓글 내용"
  }
  ```
- **Response Data**: 6.7 응답 `items` 의 단일 객체 (갱신된 content, `isMine: true`)
- **에러**:
  - 댓글 없음 → 404 `COMMENT_NOT_FOUND(1200)`
  - 본인 댓글 아님 → 403 `COMMENT_MODIFY_FORBIDDEN(1203)`

### 6.10 댓글 삭제
본인이 작성한 댓글만 삭제 가능. soft delete (`CommentEntity` `@SQLDelete` 가 `DELETE` 를 `UPDATE deleted_at` 으로 변환).

- **Method**: `DELETE`
- **URL**: `/api/v1/posts/{postId}/comments/{commentId}`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**: 비어있음
- **에러**:
  - 댓글 없음 → 404 `COMMENT_NOT_FOUND(1200)`
  - 본인 댓글 아님 → 403 `COMMENT_DELETE_FORBIDDEN(1204)`

---

## 7. 결제 관련 API (Payment)

**토스 페이먼츠 V2 연동.** `CONFIRMED` 예약만 결제 가능. 흐름:

```
[프론트] prepare → [토스 SDK 결제창] → [토스 successUrl 리다이렉트]
        → [프론트 success 페이지] → confirm → DB 반영
```

토스 키는 백엔드 `application-local.yaml` 의 `toss.client-key`/`toss.secret-key` 환경변수로 주입. 운영 시 본인 가맹점 키로 교체.

### 7.1 결제 준비 (사용자)
백엔드가 예약 검증(소유권/상태/중복) 후 토스 결제창에 필요한 메타를 발급합니다.

- **Method**: `POST`
- **URL**: `/api/v1/payments/prepare`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  { "reservationId": 10 }
  ```
- **Response Data**:
  ```json
  {
    "clientKey": "test_ck_docs_...",
    "customerKey": "user-42",
    "orderId": "RES-20240517-abc12345",
    "amount": 45000,
    "orderName": "생딸기 생크림 케이크",
    "customerName": "홍길동",
    "successUrl": "http://localhost:3000/user/reservations/checkout/success",
    "failUrl": "http://localhost:3000/user/reservations/checkout/fail"
  }
  ```
- **에러**: 본인 예약 아님(403), CONFIRMED 아님(400), 이미 결제됨(409).
- 프론트는 응답의 `clientKey` 로 `loadTossPayments(clientKey)` 호출 → 위젯 렌더링 → `widgets.requestPayment({ orderId, orderName, customerName, successUrl, failUrl })`.

### 7.2 결제 승인 (사용자)
토스 successUrl 콜백에서 받은 쿼리(`paymentKey`, `orderId`, `amount`)를 그대로 백엔드에 전달. 백엔드가 토스 `/v1/payments/confirm` 호출하여 검증 후 DB 반영.

- **Method**: `POST`
- **URL**: `/api/v1/payments/confirm`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "paymentKey": "5zJ4xY7m0kODnyRpQWGrN2xqGlNvLrKwv1M9ENjbeoPaZdL6",
    "orderId": "RES-20240517-abc12345",
    "amount": 45000
  }
  ```
- **Response Data**: 7.3 의 단일 객체.
- **에러**: 금액 불일치(400, `PAYMENT_AMOUNT_MISMATCH`), 토스 응답 검증 실패(400, `PAYMENT_VERIFICATION_FAILED`), 본인 예약 아님(403).
- 성공 시 Reservation 의 `status` 는 `PAID` 로 전이.

### 7.3 내 결제 내역 (사용자)
- **Method**: `GET`
- **URL**: `/api/v1/payments/my`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**:
  ```json
  [
    {
      "id": 5,
      "reservationId": 10,
      "amount": 45000,
      "status": "PAID",
      "paidAt": "2024-05-17T12:00:00Z",
      "paymentKey": "5zJ4xY7m0kODnyRpQWGrN2xqGlNvLrKwv1M9ENjbeoPaZdL6",
      "orderId": "RES-20240517-abc12345",
      "createdAt": "2024-05-17T12:00:00Z"
    }
  ]
  ```
- **Payment Status**: `PENDING`, `PAID`, `REFUNDED`, `FAILED` (현재 흐름은 `PAID` 만 생성)

---

## 8. 찜하기 관련 API (Favorite)

PRD 의 "찜하기 목록 추가/제거". **공개 좋아요 카운트와는 별개의 개인 위시리스트**. 한 user × product 조합은 unique.

상품 응답(`ProductResponse`)에는 `isFavorited` 필드가 포함되며, 로그인 상태에서만 사용자별 값으로 채워짐.

### 8.1 찜 추가
- **Method**: `POST`
- **URL**: `/api/v1/favorites/{productId}`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**: 비어있음
- **에러**: 상품 없음 → 404 `PRODUCT_NOT_FOUND(1700)`
- **멱등성**: 이미 찜한 상태에서 호출해도 200 통과 (서버가 중복 INSERT 시도 안 함).

### 8.2 찜 제거
- **Method**: `DELETE`
- **URL**: `/api/v1/favorites/{productId}`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**: 비어있음
- **멱등성**: 찜 되어있지 않아도 200 통과.

### 8.3 내 찜 목록
- **Method**: `GET`
- **URL**: `/api/v1/favorites/my`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data** (최신 추가순):
  ```json
  [
    {
      "id": 1,
      "productId": 5,
      "productName": "생딸기 생크림 케이크",
      "productPrice": 45000,
      "productImageUrl": "https://...",
      "productStatus": "AVAILABLE",
      "createdAt": "2026-05-20T10:00:00Z"
    }
  ]
  ```

---

## 9. 관리자 대시보드 API (Admin Dashboard)

PRD 의 "오늘의 예약 / 처리 대기 / 누적 고객 수 / 누적 매출액" 통계 전용 endpoint. 이전엔 프론트가 reservations 100건을 받아 client 측에서 계산했으나, 정확도(100건 한계)와 성능 이슈가 있어 백엔드 전용 endpoint 로 이관.

### 9.1 대시보드 통계
- **Method**: `GET`
- **URL**: `/api/v1/admin/dashboard/stats`
- **Header**: `Authorization: Bearer {accessToken}` (role = ADMIN)
- **Response Data**:
  ```json
  {
    "todayReservationCount": 3,
    "pendingReservationCount": 7,
    "totalCustomerCount": 42,
    "totalRevenue": 1875000
  }
  ```
- **계산 기준**:
  - `todayReservationCount`: `ReservationSlot.startAt` 이 오늘(Asia/Seoul) 인 활성 예약 수 (`CANCELLED` 제외)
  - `pendingReservationCount`: `status = REQUESTED` 인 예약 수
  - `totalCustomerCount`: `PaymentStatus = PAID` 인 결제를 1건 이상 보유한 고유 `userId` 수
  - `totalRevenue`: `PaymentStatus = PAID` 인 결제의 `amount` 합 (원)

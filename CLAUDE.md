# CLAUDE.md

Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 문서입니다.

## 구성

- `backend/` — Spring Boot 3.5 + Kotlin 1.9 (Java 21)
- `frontend/` — Next.js 16 + React 19 + TypeScript + Tailwind v4
- `API_SPEC.md` — 프론트/백 통신 명세. API 바뀌면 같이 수정.

## 실행

**Backend** (`backend/`)
- 실행: `./gradlew bootRun --args='--spring.profiles.active=local'` (포트 8080)
- 테스트: `./gradlew test` / 단일 테스트: `./gradlew test --tests "패키지.클래스.메서드"`
- H2 콘솔: `http://localhost:8080/h2-console` (JDBC `jdbc:h2:mem:CAKE_ORDER_PLATFORM_DB`, user `sa`, 비밀번호 없음)
- 환경변수 필수: `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `KAKAO_REDIRECT_URI` (없으면 부팅 실패)

**Frontend** (`frontend/`)
- 개발 서버: `npm run dev` (포트 3000)
- 빌드/실행: `npm run build` / `npm run start`
- 린트: `npm run lint`

## 백엔드 구조

패키지 루트: `yjh.ontongsal.cakeorderplatform`

- `core/` — 공용 인프라 (JPA 엔티티/리포지토리, JWT/Security, 응답·예외 처리, 외부 클라이언트, 설정)
- `service_api/` — 사용자용 API (`/api/v1/...`)
- `admin_api/` — 관리자용 API (`/api/v1/admin/...`)

각 도메인은 `application/`(서비스) + `presentation/`(컨트롤러, DTO)로 나뉨. 엔티티/리포지토리는 `core/persistence/`에 모아두고 모든 모듈이 공유.

### 패키지 분리 규칙 (중요)

`service_api` 와 `admin_api` 는 **서로 import 절대 금지**. 향후 별도 프로젝트로 분리될 예정이라 지금부터 독립 모듈처럼 다룬다.

- 공유는 `core/` 에서만 — `core/persistence/` (엔티티/리포지토리), `core/security/`, `core/advice/`, `core/exception/`, `core/client/`, `core/config/`.
- DTO/Service 는 각 패키지가 **자체 정의**. 같은 구조라도 중복은 의도된 것 (예: `OrderResponse` vs `AdminOrderResponse`).
- admin 측 신규 클래스는 `Admin` 접두사 컨벤션 (`AdminOrderService`, `AdminOrderResponse`, `AdminProductService`, `AdminProductResponse`, `AdminProductCreateRequest`).
- 새 코드 추가 시 반드시 검증: `grep -r "import yjh.ontongsal.cakeorderplatform.admin_api" backend/src/main/kotlin/.../service_api/` 와 그 반대 방향 모두 0건이어야 함.

### 응답·예외 처리 (중요)

컨트롤러 반환값은 `core/advice/AppResponseHandler`가 자동으로 감쌈:

```
{ "code": 200, "message": "OK", "data": <컨트롤러 반환값> }
```

컨트롤러는 도메인 DTO를 그대로 반환 (`SuccessResponse`로 감싸지 말 것). `ByteArray`, `InputStream`, `File`, `Resource`는 감싸지 않음.

에러는 `core/advice/AppExceptionHandler`가 처리. `AppException.BadRequest/Unauthorized/Forbidden/NotFound/Conflict/Internal` 중 하나를 `ErrorCode`(`core/exception/ErrorCode.kt`)와 함께 던지면 됨. 에러 코드는 도메인별 100단위 (User 1000번대, Post 1100번대 등)로 새 도메인 추가 시 새 블록 할당.

### 소프트 딜리트 컨벤션

관리자가 영구 데이터를 "삭제" 하는 엔티티(`PostEntity`, `CommentEntity`, `ProductEntity`, `ReservationSlotEntity`)는 Hibernate `@SQLDelete` + `@SQLRestriction("deleted_at IS NULL")` 으로 소프트 딜리트. `deleteById/deleteAll*` 가 자동 UPDATE 로 변환되고, `findAll/findById/existsById` 등 모든 조회가 활성 row 만 반환. 토글 데이터(`PostLike`, `ReviewLike`) 는 hard delete 유지. unique 제약이 있는 엔티티(`ReservationSlot.startAt`)는 소프트 후 충돌을 피하기 위해 unique 를 제거하고 Service 에서 활성 row 기준 중복 검사.

### 페이지네이션 컨벤션

목록 엔드포인트가 페이지네이션이 필요하면 **offset 기반**으로 통일:
- 쿼리: `?offset=0&limit=20` (0-based, `limit` 1~100 자동 보정, `offset` 은 `limit` 의 배수가 아니면 `(offset/limit)*limit` 로 자동 보정)
- 응답: `{ items, total, offset, limit }` 4-튜플
- 내부 구현은 Spring Data `PageRequest.of(offset / limit, limit, Sort.by(...))` 로 변환
- 정렬은 도메인별 기본값을 고정 (예: 상품 `createdAt desc`)
- 첫 적용 예: `GET /api/v1/admin/products`

예외 — 사용자 사이트의 무한 스크롤 화면(예: `GET /api/v1/products`)은 **커서 기반**. 쿼리 `?cursor=&limit=&category=&sort=`, 응답 `{ items, nextCursor, hasNext }`. 커서는 Base64(JSON) 의 `{ sort, lastValue, lastId }` — 정렬 키별 tie-breaker `id` 포함. cursor 의 sort 와 query 의 sort 는 일치해야 함(`PRODUCT_INVALID_CURSOR 1701`). admin 콘솔은 offset 유지.

### 인증

JWT 단일, 무상태. `JwtSecurityContextFilter`가 `Authorization: Bearer ...` 헤더를 파싱해 `TestingUserDetails`(`userId: Long` 포함)를 `SecurityContextHolder`에 넣음. 컨트롤러에서는 `@AuthenticationPrincipal userDetails: TestingUserDetails`로 받아서 `userDetails.userId` 사용.

`SecurityConfig.filterChain`은 `@Profile("local", "test")` 전용 — **프로덕션 보안 설정 없음**. 인증 없이 열린 경로: `/h2-console/**`, `GET /api/v1/products`, `GET /api/v1/products/*/reviews`, `/api/v1/users/login/kakao/**`, `/api/v1/admin/users/login/**`.

로그인 두 종류:
- 카카오 OAuth (`KakaoLoginService`) — 정상 동작
- 관리자 로그인 (`AdminLoginService`) — **더미**. 이메일/비밀번호 검증 없이 무조건 `userId=1` JWT 발급.

### JPA

- 메인 클래스에 `@EnableJpaAuditing`. 모든 엔티티는 `BaseEntity` 상속 → `createdAt`/`updatedAt` 자동.
- `kotlin("plugin.jpa")` + `allOpen` 적용 → 엔티티에 `open` 안 붙여도 됨.
- 로컬 프로필: `ddl-auto: create-drop` + `DataInitializer`가 샘플 상품 4개 시드. `db/ddl.sql`은 현재 빈 파일(`select 1`).
- `open-in-view: false` — 지연 로딩은 반드시 서비스의 `@Transactional` 안에서.

## 프론트엔드 구조

App Router (`src/app/`). 주요 경로: `/admin/*`, `/user/*`, `/oauth/kakao/callback`, `/login`, `/products`, `/orders`, `/dashboard`.

### API 레이어 (`src/api/`)

- `fetch.server.ts` — `fetchApi<T>()`가 `http://localhost:8080` 호출, **`SuccessResponse<T>`를 풀어 `data`만 반환**. 즉 `await getMyOrders()`의 결과는 `Order[]`.
- `api-client.ts` — `fetchApi` 위에 `{ get, post, put, delete }` 래퍼. 호출은 이걸로.
- `axios.server.ts` — axios 인스턴스(인터셉터에서 `.data` 언래핑). 파일명 `.server.ts`지만 둘 다 브라우저에서 실행됨 (Next 서버 컴포넌트 표시 아님).
- `types.ts` — 백엔드와 맞춘 공용 타입. `API_SPEC.md` / Kotlin DTO와 동기화 유지.
- `*.api.ts` — 도메인별 타입드 호출 함수.

### 상태

- `AuthContext` (`src/context/AuthContext.tsx`) — JWT를 `localStorage`의 `accessToken` 키에 저장. `isLoggedIn`/`login`/`logout` 제공. `fetch.server.ts`/`axios.server.ts` 가 매 요청마다 `localStorage.accessToken` 을 읽어 `Authorization: Bearer ...` 를 자동 첨부 (호출자가 명시한 헤더가 있으면 그 쪽 우선, 토큰 없거나 SSR 컨텍스트면 헤더 생략).
- `CartProvider`도 `AuthProvider`와 함께 `app/layout.tsx`에서 감쌈.

### Next.js 버전 주의 (`frontend/AGENTS.md`)

> 알고 있는 Next.js가 아님. 이 버전은 API/관례/파일 구조에 깨지는 변경이 있을 수 있음. 코드 짜기 전에 `node_modules/next/dist/docs/`를 먼저 읽을 것.

App Router 관련은 외워둔 지식 말고 설치된 문서 기준으로 확인.

## 작성 관례

- 주석/로그는 한국어. 주변 스타일에 맞출 것.
- 백엔드 DTO는 `data class` + `from(entity, ...)` 컴패니언 팩토리 (예: `OrderResponse`). 엔티티는 표현 계층에 의존하지 않음.
- DB 접근하는 서비스 메서드는 `@Transactional` / `@Transactional(readOnly = true)` 명시.
- 외부 API 호출(예: 카카오)은 **트랜잭션 밖**에서. 응답을 받아 DB에 저장하는 부분은 별도 `@Component`(예: `UserAppender`)로 분리해서 트랜잭션을 짧게 유지. 새 OAuth/연동 추가 시도 이 패턴 유지.

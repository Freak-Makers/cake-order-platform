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

### 3.1 상품 목록 조회
전체 상품 목록을 조회합니다. (사용자/관리자 공용)

- **Method**: `GET`
- **URL**: `/api/v1/products`
- **Response Data**:
  ```json
  [
    {
      "id": 1,
      "name": "생딸기 생크림 케이크",
      "description": "국산 설향 딸기가 듬뿍 들어간 케이크",
      "category": "홀케이크",
      "price": 45000,
      "imageUrl": "https://...",
      "status": "AVAILABLE",
      "createdAt": "2024-05-17T10:00:00Z",
      "updatedAt": "2024-05-17T10:00:00Z"
    }
  ]
  ```
    - **Product Status**: `AVAILABLE`, `SOLD_OUT`, `HIDDEN`

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

---

## 4. 주문 관련 API (Order)

### 4.1 새 주문 생성 (사용자)
사용자가 케이크를 주문합니다.

- **Method**: `POST`
- **URL**: `/api/v1/orders`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "productId": 1,
    "quantity": 1,
    "pickupDateTime": "2024-05-20T14:30:00Z",
    "requirements": "레터링 문구: 생일 축하해"
  }
  ```
- **Response Data**:
  ```json
  {
    "orderId": 123
  }
  ```

### 4.2 내 주문 내역 조회 (사용자)
로그인한 사용자의 주문 내역을 조회합니다.

- **Method**: `GET`
- **URL**: `/api/v1/orders/my`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**:
  ```json
  [
    {
      "id": 123,
      "orderNumber": "ORD-20240517-001",
      "productId": 1,
      "productName": "생딸기 생크림 케이크",
      "customerName": "홍길동",
      "quantity": 1,
      "totalPrice": 45000,
      "pickupDateTime": "2024-05-20T14:30:00Z",
      "requirements": "레터링 문구: 생일 축하해",
      "status": "PENDING",
      "createdAt": "2024-05-17T11:00:00Z"
    }
  ]
  ```
    - **Order Status**: `PENDING`, `MAKING`, `READY`, `COMPLETED`, `CANCELLED`

### 4.3 전체 주문 내역 조회 (관리자)
관리자가 모든 고객의 주문 내역을 확인합니다.

- **Method**: `GET`
- **URL**: `/api/v1/admin/orders`
- **Header**: `Authorization: Bearer {accessToken}`
- **Response Data**: 주문 내역 배열 (위 4.2와 동일한 구조)

### 4.4 주문 상태 변경 (관리자)
주문 상태(제작 중, 픽업 대기 등)를 변경합니다.

- **Method**: `POST`
- **URL**: `/api/v1/admin/orders/{id}/status`
- **Header**: `Authorization: Bearer {accessToken}`
- **Request Body**:
  ```json
  {
    "status": "MAKING"
  }
  ```
- **Response Data**: 업데이트된 주문 객체 반환

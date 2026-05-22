# frontend — Cake Order Platform (Nuxt 4)

`frontend/` (Next.js) 을 **Nuxt 4 로 1:1 포팅**한 프로젝트. SPA(클라이언트 전용) 로 동작하며 정적 빌드만 사용한다.

## 기술 스택

- Nuxt 4 (`ssr: false` — SPA)
- Vue 3 + `<script setup>` + TypeScript
- Pinia (`@pinia/nuxt`) — 인증·장바구니 상태
- Tailwind CSS v3 (`@nuxtjs/tailwindcss`)
- `lucide-vue-next` — 아이콘
- `@tosspayments/tosspayments-sdk` — 결제 위젯

## 실행

```bash
npm install
npm run dev        # 개발 서버 (포트 3000)
npm run generate   # 정적 SPA 빌드 → .output/public
npm run preview    # 빌드 결과 미리보기
```

`npm run generate` 결과물 `.output/public/` 를 정적 호스팅에 올리면 된다.
SPA 이므로 모든 경로를 `index.html`(또는 `200.html`) 로 폴백하도록 호스팅을 설정해야 한다.

## 환경 변수

| 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `NUXT_PUBLIC_API_BASE` | `http://localhost:8080` | 백엔드 베이스 URL |

`.env.example` 를 복사해 `.env` 로 사용한다.

## 구조

```
app/
  api/         — 백엔드 호출 (fetch 래퍼 + 도메인별 *.api.ts + 공용 타입)
  components/  — UI(Button/Card), layout(DashboardLayout/UserLayout/Sidebar), 모달
  pages/       — 파일 기반 라우팅 (Next.js app/ 경로와 1:1 대응)
  plugins/     — init.client.ts (앱 시작 시 인증/장바구니 복원)
  stores/      — Pinia (auth, cart)
  utils/       — format(cn, formatPrice), toast
  assets/css/  — tailwind.css (Tailwind 지시문 + 전역 스타일)
```

레이아웃은 Nuxt `layouts/` 대신 `DashboardLayout` / `UserLayout` 컴포넌트로 페이지를 감싼다 (원본 Next.js 구조와 동일).

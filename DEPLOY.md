# 배포 가이드

이 문서는 Cake Order Platform 을 배포할 때 필요한 환경 설정과 점검 항목을 정리한다. 프론트엔드 (Vercel) 가 먼저 올라가고, 백엔드는 추후 결정.

---

## 1. 프론트엔드 (Vercel)

### 1.1 코드 측 준비 — 이미 적용됨

| 항목 | 위치 | 비고 |
| --- | --- | --- |
| 백엔드 URL env 화 | `frontend/nuxt.config.ts` (`runtimeConfig.public.apiBase`), `frontend/app/api/fetch.ts` | `useRuntimeConfig().public.apiBase` 사용. 기본값 `http://localhost:8080` 로컬 폴백 유지. |
| 환경변수 템플릿 | `frontend/.env.example` (커밋), `frontend/.env` (gitignored) | 키는 `NUXT_PUBLIC_API_BASE` 하나. |
| `.gitignore` 화이트리스트 | `frontend/.gitignore` | `.env*` 차단 + `!.env.example` 예외. |
| 메타데이터 | `frontend/nuxt.config.ts` (`app.head`) | title/description 프로젝트 명으로 설정됨. |

### 1.2 환경 변수 (Vercel UI)

Vercel Dashboard → 프로젝트 → Settings → Environment Variables 에서 설정.

| 키 | 값 | 노출 환경 | 비고 |
| --- | --- | --- | --- |
| `NUXT_PUBLIC_API_BASE` | 백엔드 프로덕션 도메인 (예: `https://api.cake-order.example.com`) | Production / Preview / Development | `NUXT_PUBLIC_` 접두사 환경변수가 빌드 시 `runtimeConfig.public.apiBase` 를 덮어씀. SPA 라 빌드 타임에 번들로 인라인됨. 미설정 시 런타임에 `localhost:8080` 으로 폴백 → 404 만 남는다. |

> URL 확정 전이라도 placeholder 라도 넣어두면 “실수로 localhost 호출” 같은 혼선이 줄어든다.

### 1.3 Vercel 프로젝트 설정

1. GitHub 저장소 연결.
2. **Root Directory** — `frontend` 로 지정. 모노레포 구조라 필수.
3. **Framework Preset** — Nuxt.js (자동 인식).
4. **Build Command / Output Directory** — Nuxt 기본값. Vercel 의 Nuxt 프리셋이 `nuxt build` 결과(`.output`)를 자동 인식하므로 별도 입력 불필요.
5. **Node.js Version** — `package.json` 에 `engines` 미명시 → Vercel 기본 (Node 22 LTS). Nuxt 4 호환.
6. (선택) **Custom Domain** 연결.

### 1.4 로컬 검증

```bash
cd frontend
cp .env.example .env            # 이미 있으면 스킵
npm run dev                     # 로컬 백엔드(8080) 와 연결
npm run build                   # production 빌드 성공해야 Vercel 도 통과
```

### 1.5 배포 후 점검 체크리스트

- [ ] Vercel 빌드 로그에 에러 없음.
- [ ] 배포된 도메인에서 랜딩 페이지 정상 노출.
- [ ] DevTools Network 탭에서 API 호출 URL 이 `NEXT_PUBLIC_API_BASE_URL` 값으로 나가는지 확인.
- [ ] 카카오 로그인 → OAuth 콜백 → `/user/products` 정상 진입 (백엔드 측 redirect URI 갱신 후).
- [ ] 결제 흐름 (`/user/reservations/[id]/checkout` → Toss 위젯 → success/fail) end-to-end (백엔드 + Toss 측 successUrl/failUrl 갱신 후).

---

## 2. 백엔드 측 후속 작업 (FE 배포 후 필요)

> 프론트가 Vercel 도메인에서 동작하기 시작하면 백엔드 쪽 설정이 같이 따라와야 함. **백엔드 배포가 별도로 이루어지더라도 아래 항목은 FE-BE 통신을 위해 반드시 점검.**

### 2.1 CORS

현재 `backend/src/main/kotlin/yjh/ontongsal/cakeorderplatform/core/security/SecurityConfig.kt` 의 CORS 빈은 `@Profile("local", "test")` 한정이라 production 프로필에는 CORS 설정이 **없음**.

필요 작업:
- production 용 `CorsConfigurationSource` 빈 추가.
- `allowedOrigins` 에 Vercel 도메인 (`https://<project>.vercel.app` + 커스텀 도메인) 등록.
- `allowedMethods`, `allowedHeaders`, `allowCredentials` 는 기존과 동일하게.
- 환경별로 origin 을 다르게 두려면 `application-prod.yml` 같은 곳에서 외부화 권장.

### 2.2 카카오 OAuth Redirect URI

- 백엔드 환경변수 `KAKAO_REDIRECT_URI` 를 production 콜백 URL (`https://<vercel-domain>/oauth/kakao/callback`) 로 변경.
- 카카오 개발자 콘솔 → 앱 설정 → 카카오 로그인 → Redirect URI 에 동일 URL 등록 (로컬 URL 과 병행 등록 가능).

### 2.3 Toss 페이먼츠

- 백엔드 `PaymentService` 가 만들어주는 `successUrl` / `failUrl` 의 base 도메인을 production 도메인으로 갱신.
- Toss 머천트 대시보드에서 production 키 사용 시 콜백 URL 등록 필요 여부 확인.

### 2.4 백엔드 환경 변수 (참고)

부팅 시 필수 (`backend/CLAUDE.md` 의 “환경변수 필수” 참고):

| 키 | 용도 |
| --- | --- |
| `KAKAO_CLIENT_ID` | 카카오 OAuth 클라이언트 ID |
| `KAKAO_CLIENT_SECRET` | 카카오 OAuth 클라이언트 시크릿 |
| `KAKAO_REDIRECT_URI` | 카카오 OAuth 리다이렉트 URI |

production 에서는 Toss 페이먼츠 시크릿 키 / DB 접속 정보 / JWT 시크릿 등 별도 정의 필요 (현재 로컬 프로필 기준이라 미정의 항목 있음 — 백엔드 배포 작업과 함께 정리).

---

## 3. 알려진 한계 (배포 후 알아둘 것)

- **JWT 저장 방식**: `localStorage.accessToken`. HTTPS 환경에서 동작하지만, XSS 노출 위험. 추후 httpOnly 쿠키 + refresh 흐름으로 강화 가능.
- **세션 만료 처리**: 새 브라우저 세션 시작 시 토큰을 강제 클리어 (`app/stores/auth.ts` 의 `authSessionStarted` 키). 의도된 동작이지만 UX 측면에선 호불호 갈림.
- **관리자 로그인 더미**: `AdminLoginService` 는 이메일/비밀번호 검증 없이 `userId=1` JWT 발급. production 배포 전 실제 인증으로 교체 필요.
- **`SecurityConfig.filterChain` 자체가 `@Profile("local", "test")` 전용**: production 프로필용 보안 설정이 아직 없음. 백엔드 배포 시 인증/인가 정책을 명시적으로 작성해야 함.
- **다른 페이지의 마운트-즉시-fetch 401 노출**: `/dashboard` 만 가드 적용. `/admin/*`, `/user/reservations`, `/user/favorites` 등은 토큰 없이 진입 시 토스트로 401 이 노출될 수 있음. 별도 작업으로 정리 예정.

---

## 4. 빠른 명령어 모음

```bash
# 프론트 로컬 검증
cd frontend
npm install
npm run dev              # http://localhost:3000
npm run build            # production 빌드 확인 (.output)
npm run generate         # 정적 SPA 빌드 (.output/public)

# 백엔드 로컬 실행
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'    # http://localhost:8080
./gradlew test
```

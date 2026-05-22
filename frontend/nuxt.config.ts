// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SPA(클라이언트 전용) — SSR 미사용. `nuxt generate` 시 정적 SPA 로 빌드됨.
  ssr: false,

  // 개발 서버 포트 명시 (기본값도 3000이지만 의도를 분명히 함) - lsof -ti:3000 | xargs kill
  devServer: {
    port: 3000,
  },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],

  // Tailwind 지시문 + 전역 스타일이 든 CSS 파일을 명시적으로 지정
  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
  },

  // 디렉터리 접두사 없이 컴포넌트명을 그대로 사용 (예: components/ui/Button.vue → <Button>)
  components: [{ path: '~/components', pathPrefix: false }],

  runtimeConfig: {
    public: {
      // 백엔드 베이스 URL. 배포 시 NUXT_PUBLIC_API_BASE 환경변수로 덮어쓸 수 있음.
      apiBase: 'http://localhost:8080',
    },
  },

  app: {
    head: {
      title: 'Cake Order Platform',
      htmlAttrs: { lang: 'ko', class: 'h-full antialiased' },
      bodyAttrs: { class: 'min-h-full flex flex-col' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '주문 케이크 사장님을 위한 스마트한 주문 관리.' },
      ],
    },
  },
})

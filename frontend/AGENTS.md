<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 반응형 (Responsive)

모바일 우선. 기본 클래스는 모바일 기준이고, `sm:` (640px) / `md:` (768px) / `lg:` (1024px) / `xl:` (1280px) 로 큰 화면을 덮어쓴다.

- **레이아웃**: `DashboardLayout` 은 `lg` 미만에서 사이드바가 햄버거 drawer 로 전환된다 (`Sidebar` 가 `isOpen`/`onClose` 받음). `UserLayout` 은 `md` 미만에서 네비게이션이 햄버거 drawer 로 전환.
- **타이틀**: `text-xl sm:text-2xl` 처럼 단계 조정. 모바일에서 큰 글씨가 화면을 갉아먹지 않도록.
- **헤더 줄**: `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` — 타이틀과 액션 버튼을 모바일에선 세로로.
- **페이지/카드 패딩**: `px-4 sm:px-6`, `p-4 sm:p-6` — 모바일은 더 좁게.
- **버튼 그룹**: 모바일은 `w-full`, `sm:` 이상에서 `sm:w-auto` / `sm:flex-1` 등으로 회복. 풋터 버튼은 `flex-col-reverse sm:flex-row` 로 주 버튼이 위에 오게.
- **그리드**: 기본 1열, `sm:grid-cols-2`, `lg:grid-cols-3/4`. `gap-4 sm:gap-6`.
- **표**: 항상 `<div className="overflow-x-auto">` 로 감싸서 모바일에서 가로 스크롤.
- **모달**: `fixed inset-0 flex items-center justify-center p-3 sm:p-4` 컨테이너 안에 `relative flex max-h-[92vh] w-full max-w-... flex-col` 패널. `top-1/2 -translate-y-1/2` 패턴은 콘텐츠가 길어질 때 잘리므로 **사용 금지**.

자세한 컨벤션은 루트 `CLAUDE.md` 의 `반응형 디자인` 절 참고.

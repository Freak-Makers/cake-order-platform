import { Sidebar } from "./Sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />
      <main className="pl-64">
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 px-8 py-4 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-500">사장님 환영합니다!</h2>
            <div className="h-8 w-8 rounded-full bg-zinc-200" />
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

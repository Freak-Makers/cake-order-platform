"use client";

import Link from "next/link";
import {Button} from "@/components/ui/Button";
import {ArrowRight, Cake, CheckCircle2, LogOut, LayoutDashboard} from "lucide-react";
import {useAuth} from "@/context/AuthContext";

export default function LandingPage() {
  const { isLoggedIn, isLoading, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-zinc-900">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500 text-white">
              <Cake size={20}/>
            </div>
            <span className="text-lg font-bold tracking-tight sm:text-xl">Cake Admin</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {!isLoading && (
              isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="gap-2">
                      <LayoutDashboard size={18} />
                      <span className="hidden sm:inline">대시보드</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={logout} className="gap-2 text-zinc-600">
                    <LogOut size={18} />
                    <span className="hidden sm:inline">로그아웃</span>
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button variant="ghost">로그인</Button>
                </Link>
              )
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-24 sm:pt-32">
        <section className="px-5 py-12 text-center sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              주문 케이크 사장님을 위한 <br className="hidden sm:inline"/>
              <span className="text-pink-500">가장 스마트한 주문 관리</span>
            </h1>
            <p className="mt-6 text-base text-zinc-600 sm:mt-8 sm:text-xl">
              카카오톡 주문서 확인부터 결제 관리까지, <br className="hidden sm:inline"/>
              이제 Cake Admin으로 한 곳에서 편리하게 관리하세요.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 w-full gap-2 px-6 text-base sm:h-14 sm:w-auto sm:px-8">
                    대시보드로 이동
                    <ArrowRight size={20}/>
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="h-12 w-full gap-2 px-6 text-base sm:h-14 sm:w-auto sm:px-8">
                    무료로 시작하기
                    <ArrowRight size={20}/>
                  </Button>
                </Link>
              )}
              <Button size="lg" variant="outline" className="h-12 w-full px-6 text-base sm:h-14 sm:w-auto sm:px-8">
                <Link href="#features">
                  기능 살펴보기
                </Link>
              </Button>
            </div>
          </div>
        </section>


        {/* Features */}
        <section id="features" className="scroll-mt-24 bg-zinc-50 px-5 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 md:grid-cols-3 md:gap-12">
              {[
                {title: "간편한 소셜 로그인", desc: "별도의 회원가입 없이 카카오 계정으로 3초 만에 시작하세요."},
                {title: "직관적인 주문 관리", desc: "제작 대기, 제작 중, 픽업 대기 등 상태별로 주문을 관리합니다."},
                {title: "안전한 결제 연동", desc: "토스 페이먼츠 연동으로 신용카드, 계좌이체 등 다양한 결제를 지원합니다."},
              ].map((feature, i) => (
                <div key={i} className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                    <CheckCircle2 size={24}/>
                  </div>
                  <h3 className="text-lg font-bold sm:text-xl">{feature.title}</h3>
                  <p className="leading-relaxed text-zinc-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-5 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl text-center text-sm text-zinc-400">
          <p>© 2024 Cake Order Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

interface KakaoLoginModalProps {
  isOpen: boolean;
  authUrl: string;
  onClose: () => void;
  onProceed: () => void; // Function to trigger the redirect
}

export default function KakaoLoginModal({ isOpen, authUrl, onClose, onProceed }: KakaoLoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-xl sm:p-6">
        <button onClick={onClose} className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600" aria-label="닫기">
          <X size={20} />
        </button>
        <h2 className="mb-4 text-lg font-bold text-zinc-900 sm:text-xl">카카오 로그인</h2>
        <p className="mb-4 text-sm text-zinc-600 sm:text-base">아래 버튼을 눌러 카카오 계정으로 로그인하세요.</p>
        <div className="mb-6 break-words rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500 sm:text-sm">
          {authUrl}
        </div>
        <Button onClick={onProceed} className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90 focus-visible:ring-[#FEE500]">
          카카오 로그인 페이지로 이동
        </Button>
      </div>
    </div>
  );
}

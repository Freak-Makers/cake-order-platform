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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <button onClick={onClose} className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-zinc-900 mb-4">카카오 로그인</h2>
        <p className="text-zinc-600 mb-4">아래 버튼을 눌러 카카오 계정으로 로그인하세요.</p>
        <div className="text-sm text-zinc-500 break-words mb-6 p-3 border border-zinc-200 rounded-md bg-zinc-50">
          {authUrl}
        </div>
        <Button onClick={onProceed} className="w-full bg-[#FEE500] text-[#191919] hover:bg-[#FEE500]/90 focus-visible:ring-[#FEE500]">
          카카오 로그인 페이지로 이동
        </Button>
      </div>
    </div>
  );
}

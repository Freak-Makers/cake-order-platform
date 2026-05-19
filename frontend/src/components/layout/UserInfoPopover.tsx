"use client";

import { useEffect, useRef } from "react";
import { User } from "lucide-react";
import type { UserInfo } from "@/api/types";

interface Props {
  userInfo: UserInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDER_LABEL: Record<UserInfo["provider"], string> = {
  KAKAO: "카카오 계정",
  ADMIN: "관리자 계정",
};

const PROVIDER_BADGE: Record<UserInfo["provider"], string> = {
  KAKAO: "bg-amber-50 text-amber-700",
  ADMIN: "bg-zinc-100 text-zinc-700",
};

// 부모는 반드시 `relative` 컨테이너여야 함 — popover 가 absolute right-0 으로 정렬됨.
export function UserInfoPopover({ userInfo, isOpen, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // mousedown 으로 잡아야 toggle 버튼 클릭 시 즉시 close → 재오픈 사이클 발생 방지 (버튼 측에서 stopPropagation 처리)
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Esc 로도 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !userInfo) return null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="내 정보"
      className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
    >
      <div className="flex items-center gap-3 border-b border-zinc-100 p-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100 text-zinc-400">
          {userInfo.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userInfo.profileImageUrl}
              alt={userInfo.nickname}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <User size={48} className="p-2" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-zinc-900">{userInfo.nickname}</p>
          {userInfo.email && (
            <p className="truncate text-xs text-zinc-500">{userInfo.email}</p>
          )}
        </div>
      </div>
      <div className="p-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${PROVIDER_BADGE[userInfo.provider]}`}
        >
          {PROVIDER_LABEL[userInfo.provider]}
        </span>
      </div>
    </div>
  );
}

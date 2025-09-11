import React from "react";
import SearchInput from "./SearchInput";
import { UiIcons } from "../icons/iconRegistry";

type Props = {
    className?: string;
};

export default function Topbar({ className = "" }: Props) {
    const Plus = UiIcons.plus;
    const Caret = UiIcons.caret;
    const Bell = UiIcons.bell;

    return (
        <div className={`sticky top-6 z-10 flex items-center justify-between gap-6 ${className}`}>
            {/* 좌: 검색 */}
            <SearchInput className="w-[480px]" />

            {/* 우: +▾ / 알림 / 아바타 */}
            <div className="flex items-center gap-3">
                {/* + ▾  (외곽선 없이 그림자만) */}
                <button
                    type="button"
                    className="h-9 px-3 rounded-2xl bg-white shadow-[1px_1px_20px_0_rgba(112,124,154,0.10)] flex items-center gap-2"
                >
                    <Plus className="w-3 h-3 text-indigo-500" />
                    <Caret className="w-2 h-2 text-indigo-500" />
                </button>

                {/* 종 + 붉은뱃지 (외곽선 제거) */}
                <button
                    type="button"
                    className="relative h-9 w-10 rounded-2xl bg-white shadow-[1px_1px_20px_0_rgba(112,124,154,0.10)] grid place-items-center"
                >
                    <Bell className="w-5 h-5 text-indigo-500" />
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">
            1
          </span>
                </button>

                {/* 아바타 */}
                <div className="h-9 w-9 rounded-full bg-indigo-300 text-white grid place-items-center font-semibold">
                    배
                </div>
            </div>
        </div>
    );
}

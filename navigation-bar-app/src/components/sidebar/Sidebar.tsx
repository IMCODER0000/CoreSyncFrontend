import React from "react";
import { SideIcons } from "../icons/iconRegistry";
import { useActivePath } from "../../hooks/useActivePath";
import type { SideItem } from "./types";

type Props = {
    items: SideItem[];
    onNavigate?: (href: string) => void;
    className?: string;
    width?: number;
};

export default function Sidebar({
                                    items,
                                    onNavigate,
                                    className = "",
                                    width = 72,
                                }: Props) {
    const path = useActivePath();

    // 로그아웃은 하단 고정
    const mainItems = items.filter((i) => i.id !== "logout");
    const logoutItem = items.find((i) => i.id === "logout");

    return (
        <aside
            className={`h-screen bg-white shadow-[0_4px_30px_0_rgba(112,124,154,0.15)] flex flex-col items-center ${className}`}
            style={{ width }}
        >
            {/* top spacer (로고 자리) */}
            <div className="w-10 h-9 mt-9 mb-10 rounded-xl bg-neutral-300/40" />

            {/* 상단 메뉴들 */}
            <nav className="flex-1 flex flex-col items-center gap-9">
                {mainItems.map((it) => {
                    const Icon = SideIcons[it.icon];
                    const active = path.startsWith(it.href);
                    const isLeave = it.icon === "leave";

                    return (
                        <button
                            key={it.id}
                            title={it.label}
                            aria-current={active ? "page" : undefined}
                            onClick={() => onNavigate?.(it.href)}
                            className="relative w-10 h-10 grid place-items-center group"
                        >
                            <Icon
                                className={[
                                    "w-7 h-7 transition-colors transform",    // ← transform 추가
                                    isLeave ? "scale-[1.12]" : "",            // ← 살짝 키우기 (12%)
                                    active ? "text-indigo-500" : "text-neutral-600 group-hover:text-neutral-700",
                                ].join(" ")}
                            />
                            {/* 밑줄 */}
                            <span
                                className={`absolute -bottom-2 h-0.5 rounded-full transition-all ${
                                    active ? "w-6 bg-indigo-500" : "w-0 bg-transparent"
                                }`}
                            />
                        </button>
                    );
                })}
            </nav>

            {/* 하단: 로그아웃 */}
            {logoutItem && (
                <div className="mb-6">
                    <LogoutButton item={logoutItem} onNavigate={onNavigate} />
                </div>
            )}
        </aside>
    );
}

function LogoutButton({
                          item,
                          onNavigate,
                      }: {
    item: SideItem;
    onNavigate?: (href: string) => void;
}) {
    const Icon = SideIcons[item.icon];
    const handle = () => onNavigate?.(item.href);
    return (
        <button
            onClick={handle}
            className="relative w-10 h-10 grid place-items-center group"
            title={item.label}
        >
            <Icon className="w-6 h-6 text-neutral-600 group-hover:text-neutral-700" />
            {/*<span className="absolute -bottom-3 h-0.5 w-0 rounded-full bg-transparent transition-all group-hover:w-3 group-hover:bg-neutral-300" />*/}
        </button>
    );
}

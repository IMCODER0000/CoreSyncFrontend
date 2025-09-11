import React from "react";
import { UiIcons } from "../icons/iconRegistry";

type Props = {
    className?: string;
};

export default function SearchInput({ className = "" }: Props) {
    const Search = UiIcons.search;

    return (
        <div className={`relative ${className}`}>
            <input
                placeholder="검색"
                className="w-full h-12 pl-5 pr-10 rounded-3xl bg-white shadow-[1px_1px_8px_0_rgba(112,124,154,0.10)] outline-none placeholder:text-slate-400"
            />
            {/* 돋보기는 오른쪽 */}
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-indigo-500" />
        </div>
    );
}

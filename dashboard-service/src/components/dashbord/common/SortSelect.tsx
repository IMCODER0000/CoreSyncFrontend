import React, {useEffect, useRef, useState} from "react";

export type SortValue = "latest" | "oldest" | "popular";

const LABEL: Record<SortValue, string> = {
    latest: "최신순",
    oldest: "오래된순",
    popular: "인기순",
};

type Props = {
    value: SortValue;
    onChange: (v: SortValue) => void;
    className?: string;
};

export default function SortSelect({value, onChange, className = ""}: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="
          h-7 w-28 px-2
          bg-white rounded-lg border border-gray-300
          inline-flex items-center justify-between
          text-xs text-slate-600
        "
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {LABEL[value]}
                <svg
                    viewBox="0 0 24 24"
                    className="ml-1 w-3 h-3 text-gray-400"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </button>

            {open && (
                <ul
                    role="listbox"
                    className="absolute right-0 mt-1 w-28 bg-white border border-gray-200 rounded-md shadow-md py-1 text-xs text-slate-700 z-10"
                >
                    {(["latest", "oldest", "popular"] as SortValue[]).map((k) => (
                        <li key={k}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={value === k}
                                onClick={() => {
                                    onChange(k);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1 hover:bg-gray-50 ${
                                    value === k ? "font-semibold text-blue-600" : ""
                                }`}
                            >
                                {LABEL[k]}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

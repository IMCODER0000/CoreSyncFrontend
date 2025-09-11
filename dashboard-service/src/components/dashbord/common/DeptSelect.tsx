import {useEffect, useRef, useState} from "react";

type DeptOption = { value: string; label: string };

const DEFAULT_OPTIONS: DeptOption[] = [
    {value: "ALL", label: "전체"},
    {value: "HR", label: "인사팀"},
    {value: "SALES", label: "영업팀"},
    {value: "BACKEND", label: "백엔드팀"},
    {value: "FRONTEND", label: "프론트엔드팀"},
    {value: "DESIGN", label: "디자인팀"},
];

export default function DeptSelect({
                                       value,
                                       onChange,
                                       options = DEFAULT_OPTIONS,
                                       className = "",
                                   }: {
    value: string;
    onChange: (v: string) => void;
    options?: DeptOption[];
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const current = options.find((o) => o.value === value) ?? options[0];

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
                title="부서 선택"
            >
                {current.label}
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
                    className="
            absolute right-0 mt-1 w-28
            bg-white border border-gray-200 rounded-md shadow-md
            py-1 text-xs text-slate-700 z-10
          "
                >
                    {options.map((opt) => {
                        const active = opt.value === current.value;
                        return (
                            <li key={opt.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={active}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-1 hover:bg-gray-50 ${
                                        active ? "font-semibold text-blue-600" : ""
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

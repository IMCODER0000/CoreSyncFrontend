import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    size?: number; // px
};

export default function IconButton({ className = "", active, size = 40, ...rest }: Props) {
    return (
        <button
            {...rest}
            style={{ width: size, height: size }}
            className={`grid place-items-center rounded-xl transition
        ${active ? "bg-indigo-50 text-indigo-600" : "hover:bg-slate-50 text-neutral-600"}
        ${className}`}
        />
    );
}

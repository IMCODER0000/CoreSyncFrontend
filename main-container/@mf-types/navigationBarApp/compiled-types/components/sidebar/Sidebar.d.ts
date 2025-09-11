import type { SideItem } from "./types";
type Props = {
    items: SideItem[];
    onNavigate?: (href: string) => void;
    className?: string;
    width?: number;
};
export default function Sidebar({ items, onNavigate, className, width, }: Props): import("react/jsx-runtime").JSX.Element;
export {};

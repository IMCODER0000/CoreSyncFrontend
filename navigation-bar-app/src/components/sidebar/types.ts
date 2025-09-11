import type { SideIconKey } from "../icons/iconRegistry";

export type SideItem = {
    id: string;
    href: string;
    label: string;
    icon: SideIconKey; // 문자열 키를 받게 (이게 핵심)
};


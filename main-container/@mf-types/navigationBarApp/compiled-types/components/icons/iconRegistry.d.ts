import type React from "react";
export type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;
export type SideIconKey = "dashboard" | "user" | "attendance" | "board" | "docs" | "leave" | "logout";
export type UiIconKey = "search" | "bell" | "plus" | "caret";
export declare const SideIcons: Record<SideIconKey, IconComponent>;
export declare const UiIcons: Record<UiIconKey, IconComponent>;

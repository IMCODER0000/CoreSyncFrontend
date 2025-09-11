import type React from "react";

// 아이콘 컴포넌트 타입
export type IconComponent = React.FC<React.SVGProps<SVGSVGElement>>;

// 사이드바 아이콘 키
export type SideIconKey =
    | "dashboard"
    | "user"
    | "attendance"
    | "board"
    | "docs"
    | "leave"
    | "logout";

// 탑바 아이콘 키
export type UiIconKey = "search" | "bell" | "plus" | "caret";


import Dashboard from "../../assets/icons/대시보드.svg";
import Attendance from "../../assets/icons/출퇴근.svg";
import Board from "../../assets/icons/게시판.svg";
import Docs from "../../assets/icons/계약서.svg";
import User from "../../assets/icons/사용자.svg";
import Leave from "../../assets/icons/휴가.svg";
import Logout from "../../assets/icons/log-out.svg";

import Search from "../../assets/icons/search.svg";
import Bell from "../../assets/icons/bell.svg";
import Plus from "../../assets/icons/플러스.svg";
import Caret from "../../assets/icons/내림.svg"


// 사이드바 아이콘
export const SideIcons: Record<SideIconKey, IconComponent> =  {
    dashboard: Dashboard,
    attendance: Attendance,
    board: Board,
    docs: Docs,
    user: User,
    leave: Leave,
    logout: Logout,
} satisfies Record<string, IconComponent>;

// 탑바 아이콘
export const UiIcons : Record<UiIconKey, IconComponent> =  {
    search: Search,
    bell: Bell,
    plus: Plus,
    caret: Caret,
} satisfies Record<string, IconComponent>;


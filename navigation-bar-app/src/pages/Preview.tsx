import Sidebar from "../components/sidebar/Sidebar";
import Topbar from "../components/topbar/Topbar";
import type { SideItem } from "../components/sidebar/types";

const items: SideItem[] = [
    { id: "dashboard", href: "/dashboard", label: "대시보드", icon: "dashboard" },
    { id: "user", href: "/user", label: "내 프로필", icon: "user" },
    { id: "attendance", href: "/attendance", label: "출퇴근", icon: "attendance" },
    { id: "leave", href: "/leave", label: "휴가", icon: "leave" },
    { id: "board", href: "/board", label: "게시판", icon: "board" },
    { id: "docs", href: "/docs", label: "문서", icon: "docs" },
    // logout은 하단에서 렌더링
    { id: "logout", href: "/logout", label: "로그아웃", icon: "logout" },
];

export default function Preview() {
    const go = (href: string) => (window.location.href = href);

    return (
        <div className="flex">
            <Sidebar items={items} onNavigate={go} className="sticky left-0 top-0" />

            <main className="flex-1 px-8">
                {/* top bar (조금 내려가게) */}
                <Topbar className="mb-4" />

                {/* 제목은 Topbar보다 더 아래로 */}
                <h1 className="mt-10 text-3xl font-bold text-slate-900">Dashboard</h1>

                {/* 컨텐츠 카드 예시 */}
                <section className="mt-6 rounded-[30px] h-72 bg-white shadow-[1px_1px_20px_0_rgba(112,124,154,0.10)]" />
            </main>
        </div>
    );
}

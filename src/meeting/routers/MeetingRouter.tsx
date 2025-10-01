import {Routes, Route, Navigate} from "react-router-dom";
import CalendarPage from "../pages/CalendarPage.tsx";
import ListPage from "../pages/ListPage.tsx";
import MeetingPage from "../pages/MeetingPage.tsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="calendar" replace />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="list" element={<ListPage />} />
            <Route path=":id" element={<MeetingPage />} />

            {/* [NEW] 디버그용 NoMatch — 현재 경로 확인 */}
            <Route path="*" element={<div style={{padding:16}}>NoMatch in /meeting/* — 경로를 확인하세요.</div>} />
        </Routes>
    );
}
import {Routes, Route, Navigate} from "react-router-dom";
import CalendarPage from "../pages/CalendarPage.tsx";
import ListPage from "../pages/ListPage.tsx";

export default function AppRoutes() {
    return (
        <Routes>
            <Route index element={<Navigate to="calendar" replace />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="list" element={<ListPage />} />
        </Routes>
    );
}
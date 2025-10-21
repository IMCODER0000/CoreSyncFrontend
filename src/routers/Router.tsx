import {lazy, Suspense} from "react"
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { MainLayout, SidebarLayout } from "../common_ui";
import { ProtectedRoute } from "../auth/routers/AuthRouters.tsx";

// 랜딩 페이지
const Home = lazy(() => import("../landing/pages/Home.tsx"));

// 레이아웃이 적용된 페이지들
const ComponentExamples = lazy(() => import("../common_ui/examples/ExamplePage.tsx"));
const MyWorkspacePage = lazy(() => import("../workspace/pages/MyWorkspacePage.tsx"));
// Profile 컴포넌트 임포트 (기본 내보내기가 있는지 확인 필요)
const Profile = lazy(() => import("../profile/pages/Profile.tsx"));
const Meeting = lazy(() => import("../meeting/routers/MeetingRouter.tsx"));
const AuthRouters = lazy(() => import("../auth/routers/AuthRouters.tsx"));
const AgileRouter = lazy(() => import("../agile/routers/AgileRouter.tsx"));
const TeamDetailPage = lazy(() => import("../team/pages/TeamDetailPage.tsx"));
const TeamSettingsPage = lazy(() => import("../team/pages/TeamSettingsPage.tsx"));
const GuestLoginPage = lazy(() => import("../pages/GuestLoginPage.tsx"));
const AttendancePage = lazy(() => import("../attendance/pages/AttendancePage.tsx"));
const TeamLeaderAttendancePage = lazy(() => import("../attendance/pages/TeamLeaderAttendancePage.tsx"));
const DashboardPage = lazy(() => import("../dashboard/pages/DashboardPage.tsx"));






function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>

                    <Route path="/" element={<Home/>}/>
                    <Route path="/guest/login" element={<GuestLoginPage />}/>
                    <Route path="/auth/*" element={<AuthRouters />}/>

                    <Route element={<SidebarLayout />}>
                        <Route path="/workspace" element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <MyWorkspacePage/>
                                </MainLayout>
                            </ProtectedRoute>
                        }/>
                        <Route path="/ui-components" element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <ComponentExamples/>
                                </MainLayout>
                            </ProtectedRoute>
                        }/>

                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Profile/>
                            </ProtectedRoute>
                        }/>

                        <Route path="/meeting/*" element={
                            <ProtectedRoute>
                                <Meeting/>
                            </ProtectedRoute>
                        }/>

                        <Route path="/agile/*" element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <AgileRouter/>
                                </MainLayout>
                            </ProtectedRoute>
                        }/>

                        <Route path="/team/:teamId" element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <TeamDetailPage/>
                                </MainLayout>
                            </ProtectedRoute>
                        }/>

                        <Route path="/team/:teamId/settings" element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <TeamSettingsPage/>
                                </MainLayout>
                            </ProtectedRoute>
                        }/>

                        <Route path="/attendance" element={
                            <ProtectedRoute>
                                <AttendancePage/>
                            </ProtectedRoute>
                        }/>

                        <Route path="/attendance/leader" element={
                            <ProtectedRoute>
                                <TeamLeaderAttendancePage/>
                            </ProtectedRoute>
                        }/>

                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <DashboardPage/>
                            </ProtectedRoute>
                        }/>
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRouter;
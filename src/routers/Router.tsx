import {lazy, Suspense} from "react"
import {BrowserRouter, Route, Routes} from "react-router-dom";
import { MainLayout, SidebarLayout } from "../common_ui";

// 랜딩 페이지
const Home = lazy(() => import("../landing/pages/Home.tsx"));

// 레이아웃이 적용된 페이지들
const ComponentExamples = lazy(() => import("../common_ui/examples/ExamplePage.tsx"));
const Workspace = lazy(() => import("../workspace/pages/Workspace.tsx"));
// Profile 컴포넌트 임포트 (기본 내보내기가 있는지 확인 필요)
const Profile = lazy(() => import("../profile/pages/Profile.tsx"));
const Meeting = lazy(() => import("../meeting/routers/MeetingRouter.tsx"));

function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>

                    <Route path="/" element={<Home/>}/>

                    <Route element={<SidebarLayout />}>
                        <Route path="/workspace" element={
                            <MainLayout>
                                <Workspace/>
                            </MainLayout>
                        }/>
                        <Route path="/ui-components" element={
                            <MainLayout>
                                <ComponentExamples/>
                            </MainLayout>
                        }/>

                        <Route path="/profile" element={
                            <Profile/>
                        }/>

                        <Route path="/meeting/*" element={
                            <Meeting/>
                        }/>
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRouter;
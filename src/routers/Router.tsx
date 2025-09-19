import {lazy, Suspense} from "react"
import {BrowserRouter, Route, Routes} from "react-router-dom";


const Home = lazy(() => import("../landing/pages/Home.tsx"));
const ComponentExamples = lazy(() => import("../common_ui/examples/ExamplePage.tsx"));

function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/ui-components" element={<ComponentExamples/>}/>
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRouter;

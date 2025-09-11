import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

import { CircularProgress } from "@mui/material";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const NavigationBarApp = React.lazy(() => import("navigationBarApp/App"));

const App = () => {
    return (
        <BrowserRouter>
            {/* 간단한 레이아웃: 상단 네비 + 본문 */}
            <div style={{ display: "grid", gridTemplateRows: "auto 1fr", minHeight: "100vh" }}>
                <header>
                    <Suspense fallback={<div style={{ padding: 8 }}><CircularProgress size={20} /></div>}>
                        <NavigationBarApp />
                    </Suspense>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={<div>Home Page</div>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;

const container = document.getElementById("app") as HTMLElement;
if (!container) throw new Error("Root container #app not found");

const root = ReactDOM.createRoot(container);
root.render(<App />);

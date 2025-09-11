import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import AuthenticationRouter from "./router/AuthenticationRouter.tsx"

const App = () => {
    console.log("Authentication Integration App Rendering");

    return (
        <AuthenticationRouter/>
    );
}

export default App
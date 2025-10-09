// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./local-components/"
// import public from "/asset-filename.ext"

import "@/client/global-style/Global.css"; // Global CSS style to be injected at app entry point for consistency across all pages.

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/client/global-services/router";
import AuthProvider from "../global-components/AuthProvider";

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(
    <React.StrictMode>
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
);

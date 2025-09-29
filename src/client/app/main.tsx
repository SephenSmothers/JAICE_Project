// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./local-components/"
// import public from "/asset-filename.ext"

import "@/client/global-style/Global.css"; // Global CSS style to be injected at app entry point for consistency across all pages.

import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { router } from "@/client/global-services/router";

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(<RouterProvider router={router} />);

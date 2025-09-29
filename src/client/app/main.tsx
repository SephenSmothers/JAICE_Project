// import assets from "@/client/assets/"
// import globalComponents from "@/client/global-components/"
// import localComponents from "./local-components/"
// import public from "/asset-filename.ext"

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/client/global-style/Global.css' // Global CSS style to be injected at app entry point for consistency across all pages.

import LandingPage from '@/client/pages/landing/LandingPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
)

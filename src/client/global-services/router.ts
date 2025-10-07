import { createBrowserRouter, redirect } from "react-router";
import { waitForAuth } from "./auth";

import { LandingRoute } from "@/client/pages/landing/landing.meta";
import { NavigationBarRoute } from "@/client/app/layouts/navigation.meta";
import { HomeRoute } from "@/client/pages/home/home.meta";
import { AboutRoute } from "@/client/pages/about/about.meta";
import { DashboardRoute } from "@/client/pages/dashboard/dashboard.meta";
import { AccountRoute } from "@/client/pages/settings/account/account.meta";
import { AccessibilityRoute } from "@/client/pages/settings/accessibility/accessibility.meta";
import { NotificationsRoute } from "@/client/pages/settings/notifications/notification.meta";

// Guard Loader (runs on client-side navigation)
async function requireAuth() {
  const user = await waitForAuth();
  if (!user) {
    // bounce to Landing (or /login)
    throw redirect(LandingRoute.path);
  }
  return user;
}

export const router = createBrowserRouter([
  {
    path: LandingRoute.path,
    element: LandingRoute.element,
  },
  {
    path: AboutRoute.path,
    element: AboutRoute.element,
  },
  {
    element: NavigationBarRoute.element,
    children: [
      {
        path: HomeRoute.path,
        element: HomeRoute.element,
        loader: requireAuth,
      },

      {
        path: DashboardRoute.path,
        element: DashboardRoute.element,
        loader: requireAuth,
      },
      {
        path: AccountRoute.path,
        element: AccountRoute.element,
        loader: requireAuth,
      },
      {
        path: AccessibilityRoute.path,
        element: AccessibilityRoute.element,
        loader: requireAuth,
      },
      {
        path: NotificationsRoute.path,
        element: NotificationsRoute.element,
        loader: requireAuth,
      },
    ],
  },
]);

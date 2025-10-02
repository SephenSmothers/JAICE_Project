import { createBrowserRouter } from "react-router";
import { LandingRoute } from "@/client/pages/landing/landing.meta";
import { NavigationBarRoute } from "@/client/app/layouts/navigation.meta";
import { HomeRoute } from "@/client/pages/home/home.meta";
import { AboutRoute } from "@/client/pages/about/about.meta";
import { DashboardRoute } from "@/client/pages/dashboard/dashboard.meta";

import { AccountRoute } from "@/client/pages/settings/account/account.meta";
import { AccessibilityRoute } from "@/client/pages/settings/accessibility/accessibility.meta";
import { NotificationsRoute } from "@/client/pages/settings/notifications/notification.meta";

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
      },

      {
        path: DashboardRoute.path,
        element: DashboardRoute.element,
      },
      {
        path: AccountRoute.path,
        element: AccountRoute.element,
      },
      {
        path: AccessibilityRoute.path,
        element: AccessibilityRoute.element,
      },
      {
        path: NotificationsRoute.path,
        element: NotificationsRoute.element,
      },
    ],
  },
]);

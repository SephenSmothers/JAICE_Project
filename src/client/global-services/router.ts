import { createBrowserRouter, redirect } from "react-router-dom";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/client/global-services/firebase";

import { LandingRoute } from "@/client/pages/landing/landing.meta";
import { NavigationBarRoute } from "@/client/app/layouts/navigation.meta";
import { HomeRoute } from "@/client/pages/home/home.meta";
import { AboutRoute } from "@/client/pages/about/about.meta";
import { DashboardRoute } from "@/client/pages/dashboard/dashboard.meta";
import { AccountRoute } from "@/client/pages/settings/account/account.meta";
import { AccessibilityRoute } from "@/client/pages/settings/accessibility/accessibility.meta";
import { NotificationsRoute } from "@/client/pages/settings/notifications/notification.meta";

// Wait until Firebasse Auth initializes and sets the current user
function waitForAuth(timeoutMs = 5000): Promise<User | null> {
  // If Firebase already has a current user, resolve immediately
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
    // Safety timeout
    setTimeout(() => {
      try { unsubscribe(); } catch {}
      resolve(auth.currentUser);
    }, timeoutMs);
  });
}

// Loader for protected routes that require authentication
async function requireAuth() {
  const user = await waitForAuth();
  if (!user) throw redirect(LandingRoute.path);
  return null;
}

// All routes with 'loade: requireAuth' are protected and require authentication
// Public routes (no authentication required) do not have this loader
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

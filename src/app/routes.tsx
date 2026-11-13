import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router";

const Splash = React.lazy(() =>
  import("./pages/Splash").then((m) => ({ default: m.Splash })),
);
const Auth = React.lazy(() =>
  import("./pages/Auth").then((m) => ({ default: m.Auth })),
);
const ForgotPassword = React.lazy(() =>
  import("./pages/ForgotPassword").then((m) => ({ default: m.ForgotPassword })),
);
const ResetPassword = React.lazy(() =>
  import("./pages/ResetPassword").then((m) => ({ default: m.ResetPassword })),
);
const TermsPage = React.lazy(() =>
  import("./pages/Terms").then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = React.lazy(() =>
  import("./pages/Privacy").then((m) => ({ default: m.PrivacyPage })),
);
const Dashboard = React.lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const Schedule = React.lazy(() =>
  import("./pages/Schedule").then((m) => ({ default: m.Schedule })),
);
const Appointments = React.lazy(() =>
  import("./pages/Appointments").then((m) => ({ default: m.Appointments })),
);
const MapPage = React.lazy(() =>
  import("./pages/Map").then((m) => ({ default: m.MapPage })),
);
const Rewards = React.lazy(() =>
  import("./pages/Rewards").then((m) => ({ default: m.Rewards })),
);
const Guide = React.lazy(() =>
  import("./pages/Guide").then((m) => ({ default: m.Guide })),
);
const Profile = React.lazy(() =>
  import("./pages/Profile").then((m) => ({ default: m.Profile })),
);
const Layout = React.lazy(() =>
  import("./components/Layout").then((m) => ({ default: m.Layout })),
);

const routeFallback = (
  <div className="min-h-screen bg-eco-black flex items-center justify-center text-eco-neon">
    Carregando...
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={routeFallback}>
        <Layout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={routeFallback}>
            <Splash />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={routeFallback}>
            <Auth />
          </Suspense>
        ),
      },
      {
        path: "register",
        element: (
          <Suspense fallback={routeFallback}>
            <Auth />
          </Suspense>
        ),
      },
      {
        path: "forgot-password",
        element: (
          <Suspense fallback={routeFallback}>
            <ForgotPassword />
          </Suspense>
        ),
      },
      {
        path: "reset-password",
        element: (
          <Suspense fallback={routeFallback}>
            <ResetPassword />
          </Suspense>
        ),
      },
      {
        path: "terms",
        element: (
          <Suspense fallback={routeFallback}>
            <TermsPage />
          </Suspense>
        ),
      },
      {
        path: "privacy",
        element: (
          <Suspense fallback={routeFallback}>
            <PrivacyPage />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={routeFallback}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "schedule",
        element: (
          <Suspense fallback={routeFallback}>
            <Schedule />
          </Suspense>
        ),
      },
      {
        path: "appointments",
        element: (
          <Suspense fallback={routeFallback}>
            <Appointments />
          </Suspense>
        ),
      },
      {
        path: "map",
        element: (
          <Suspense fallback={routeFallback}>
            <MapPage />
          </Suspense>
        ),
      },
      {
        path: "rewards",
        element: (
          <Suspense fallback={routeFallback}>
            <Rewards />
          </Suspense>
        ),
      },
      {
        path: "guide",
        element: (
          <Suspense fallback={routeFallback}>
            <Guide />
          </Suspense>
        ),
      },
      {
        path: "profile",
        element: (
          <Suspense fallback={routeFallback}>
            <Profile />
          </Suspense>
        ),
      },
    ],
  },
]);

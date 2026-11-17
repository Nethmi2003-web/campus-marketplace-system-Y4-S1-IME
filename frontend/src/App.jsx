import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage"));
const SellerRequestStatusPage = React.lazy(() =>
  import("./pages/SellerRequestStatusPage")
);
const MarketplaceUI = React.lazy(() => import("./components/MarketplaceUI"));
const UserDasboardd = React.lazy(() => import("./pages/UserDasboardd"));
const AdmnDashboardd = React.lazy(() => import("./pages/AdmnDashboardd"));
const SellerDashboardd = React.lazy(() => import("./pages/SellerDashboardd"));
const MainLayout = React.lazy(() => import("./components/MainLayout"));
const HomePage = React.lazy(() => import("./pages/marketing/HomePage"));
const PricingPage = React.lazy(() => import("./pages/marketing/PricingPage"));
const FinancialsPage = React.lazy(() =>
  import("./pages/marketing/FinancialsPage")
);
const JoinPage = React.lazy(() => import("./pages/marketing/JoinPage"));
const ContactPage = React.lazy(() => import("./pages/marketing/ContactPage"));
const HowItWorksPage = React.lazy(() =>
  import("./pages/marketing/FeaturePages").then((module) => ({
    default: module.HowItWorksPage,
  }))
);
const CustomersPage = React.lazy(() =>
  import("./pages/marketing/FeaturePages").then((module) => ({
    default: module.CustomersPage,
  }))
);
const MarketPage = React.lazy(() =>
  import("./pages/marketing/FeaturePages").then((module) => ({
    default: module.MarketPage,
  }))
);
const SwotPage = React.lazy(() =>
  import("./pages/marketing/FeaturePages").then((module) => ({
    default: module.SwotPage,
  }))
);
const GrowthPage = React.lazy(() =>
  import("./pages/marketing/FeaturePages").then((module) => ({
    default: module.GrowthPage,
  }))
);
const OperationsPage = React.lazy(() =>
  import("./pages/marketing/FeaturePages").then((module) => ({
    default: module.OperationsPage,
  }))
);
const RoadmapPage = React.lazy(() =>
  import("./pages/marketing/FeaturePages").then((module) => ({
    default: module.RoadmapPage,
  }))
);
const AboutPage = React.lazy(() =>
  import("./pages/marketing/FeaturePages").then((module) => ({
    default: module.AboutPage,
  }))
);
const MarketingLayout = React.lazy(() =>
  import("./components/brand/MarketingLayout").then((module) => ({
    default: module.MarketingLayout,
  }))
);

function MarketingLoading() {
  return (
    <div className="cc-loading" role="status">
      Loading UniSwap…
    </div>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        {/* Public UniSwap Marketing Pages */}
        <Route
          element={
            <Suspense fallback={<MarketingLoading />}>
              <MarketingLayout />
            </Suspense>
          }
        >
          <Route
            path="/"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="/how-it-works"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <HowItWorksPage />
              </Suspense>
            }
          />
          <Route
            path="/pricing"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <PricingPage />
              </Suspense>
            }
          />
          <Route
            path="/customers"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <CustomersPage />
              </Suspense>
            }
          />
          <Route
            path="/market"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <MarketPage />
              </Suspense>
            }
          />
          <Route
            path="/swot"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <SwotPage />
              </Suspense>
            }
          />
          <Route
            path="/growth"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <GrowthPage />
              </Suspense>
            }
          />
          <Route
            path="/operations"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <OperationsPage />
              </Suspense>
            }
          />
          <Route
            path="/financials"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <FinancialsPage />
              </Suspense>
            }
          />
          <Route
            path="/roadmap"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <RoadmapPage />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="/join"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <JoinPage />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<MarketingLoading />}>
                <ContactPage />
              </Suspense>
            }
          />
        </Route>

        {/* Auth & Marketplace Routes */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<MarketingLoading />}>
              <MainLayout>
                <LoginPage />
              </MainLayout>
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<MarketingLoading />}>
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            </Suspense>
          }
        />
        <Route
          path="/seller-request-status"
          element={
            <Suspense fallback={<MarketingLoading />}>
              <MainLayout>
                <SellerRequestStatusPage />
              </MainLayout>
            </Suspense>
          }
        />
        <Route
          path="/items"
          element={
            <Suspense fallback={<MarketingLoading />}>
              <MainLayout>
                <MarketplaceUI />
              </MainLayout>
            </Suspense>
          }
        />

        {/* Isolated Role-Based Dashboards */}
        <Route
          path="/user-dashboard"
          element={
            <Suspense fallback={<MarketingLoading />}>
              <UserDasboardd />
            </Suspense>
          }
        />
        <Route
          path="/seller-dashboard"
          element={
            <Suspense fallback={<MarketingLoading />}>
              <SellerDashboardd />
            </Suspense>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <Suspense fallback={<MarketingLoading />}>
              <AdmnDashboardd />
            </Suspense>
          }
        />

        {/* Safe Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;
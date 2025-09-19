import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/login.jsx";
import SignupPage from "./pages/signup.jsx";
import ResetPasswordPage from "./pages/reset-password.jsx";
import OAuthTestPage from "./pages/oauth-test.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/homepage.jsx";
import Navbar from "./components/Navbar.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { PaymentProvider, usePayment } from "./contexts/PaymentContext.jsx";
import DashboardPage from "./pages/dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import FavoritesPage from "./pages/FavoratesPage.jsx";
import MyLandingPages from "./pages/MyLandingPages.jsx";
import IdeaDetailPage from "./pages/IdeaDetailPage.jsx";
import LandingPageViewer from "./pages/landingPage.jsx";
import LandingPageView from "./pages/LandingPageView.jsx";
import TemplateSelector from "./pages/TemplateSelector.jsx";
import TestTemplatePreview from "./pages/TestTemplatePreview.jsx";
import NotFound from "./pages/NotFound.jsx";
import GoogleCallback from "./pages/googleCallback.jsx";
import VerifyEmailPage from "./pages/verify-email.jsx";
import PaymentSuccessPage from "./pages/PaymentSuccessPage.jsx";
import PaymentCancelPage from "./pages/PaymentCancelPage.jsx";
import { AnimatePresence } from "framer-motion";
import AnimatedPage from "./components/AnimatedPage";
import EnhancedAnimatedNavbar from "./components/Navbar.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const { isModalOpen } = usePayment();

  // Hide navbar on auth pages or when modal is open
  const isAuthPage = [
    "/login",
    "/signup",
    "/reset-password",
    "/verify-email",
    "/oauth-test",
    "/google/callback"
  ].includes(location.pathname);

  const shouldHideNavbar = isAuthPage || isModalOpen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {!shouldHideNavbar && <EnhancedAnimatedNavbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          } />
          <Route path="/google/callback" element={<GoogleCallback />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/oauth-test" element={<OAuthTestPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <DashboardPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />

          <Route
            path="/idea/:id"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <IdeaDetailPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/landingPage/:businessIdeaId"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <LandingPageViewer />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/landing-page/:landingPageId"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <LandingPageView />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates/:businessIdeaId"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <TemplateSelector />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/test-template"
            element={<TestTemplatePreview />}
          />
          <Route
            path="/templates/:businessIdeaId"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <TemplateSelector />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <FavoritesPage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <UserProfilePage />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-landing-pages"
            element={
              <ProtectedRoute>
                <AnimatedPage>
                  <MyLandingPages />
                </AnimatedPage>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <PaymentProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </PaymentProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

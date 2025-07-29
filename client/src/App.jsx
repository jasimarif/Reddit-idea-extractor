import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "./pages/login.jsx";
import SignupPage from "./pages/signup.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import HomePage from "./pages/homepage.jsx";
import Navbar from "./components/Navbar.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import DashboardPage from "./pages/dashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import FavoritesPage from "./pages/FavoratesPage.jsx";
import IdeaDetailPage from "./pages/IdeaDetailPage.jsx";
import LandingPageViewer from "./pages/landingPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import GoogleCallback from "./pages/googleCallback.jsx";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/google/callback" element={<GoogleCallback />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/idea/:id"
                  element={
                    <ProtectedRoute>
                      <IdeaDetailPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/landingPage/:id"
                  element={
                    <ProtectedRoute>
                      <LandingPageViewer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </div>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

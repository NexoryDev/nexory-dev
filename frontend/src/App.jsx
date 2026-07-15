import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import GitHub from './pages/GitHub';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import Login from "./pages/Login";
import Me from "./pages/profile/Me";
import Settings from "./pages/profile/Settings";
import Products from "./pages/profile/Products";
import ProtectedRoute from "./auth/ProtectedRoute";
import DashboardLayout from "./pages/profile/DashboardLayout";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/user/UserProfile";
import GitHubCallback from "./pages/GitHubCallback";
import Services from "./pages/services";

function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/me');
  const showFooter = !location.pathname.startsWith('/me');

  return (
    <>
      <ScrollToTop />
      <div id="page" style={{ opacity: 1, transition: 'opacity 0.4s ease' }}>
        {showNavbar ? <Navbar /> : null}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/github" element={<GitHub />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/reset/:token" element={<ResetPassword />} />

          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Me />} />
            <Route path="products" element={<Products />} />
            <Route path="settings" element={<Settings />} />
            <Route path="licenses" element={<Me />} />
            <Route path="billing" element={<Products />} />
            <Route path="orders" element={<Products />} />
            <Route path="security" element={<Settings />} />
            <Route path="api" element={<Products />} />
          </Route>
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/github/callback" element={<GitHubCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {showFooter ? <Footer /> : null}
      </div>
    </>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import AccountLayout from "./pages/profile/AccountLayout";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import UserProfile from "./pages/user/UserProfile";
import GitHubCallback from "./pages/GitHubCallback";

function AppContent() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div id="page" style={{ opacity: 1, transition: 'opacity 0.4s ease' }}>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
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
                <AccountLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Me />} />
            <Route path="products" element={<Products />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/user/:username" element={<UserProfile />} />
          <Route path="/github/callback" element={<GitHubCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Footer />
      </div>
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

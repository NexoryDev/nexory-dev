import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import GitHub from './pages/GitHub';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import Login from "./pages/Login";
import Me from "./pages/account/me";
import Settings from "./pages/account/settings";
import Products from "./pages/account/Products";
import ProtectedRoute from "./auth/ProtectedRoute";
import AccountLayout from "./pages/account/AccountLayout";

const MIN_PRELOADER_MS = 700;
const BOOTSTRAP_TIMEOUT_MS = 4000;

function fetchGitHubBootstrap() {
  return fetch('/api/github?endpoint=dashboard')
    .then(response => {
      if (!response.ok) {
        throw new Error('github bootstrap failed');
      }
      return response.json();
    })
    .then(data => ({ data, error: false }))
    .catch(() => ({ data: null, error: true }));
}

function AppContent() {
  const { loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [githubBootstrap, setGithubBootstrap] = useState({ data: null, error: false });

  useEffect(() => {
    let active = true;

    const minDelay = new Promise(resolve => setTimeout(resolve, MIN_PRELOADER_MS));
    const githubLoad = fetchGitHubBootstrap();

    Promise.all([minDelay, githubLoad]).then(([, bootstrap]) => {
      if (!active) return;
      setGithubBootstrap(bootstrap);
      setReady(true);
    });

    const hardTimeout = setTimeout(() => {
      if (!active) return;
      setReady(true);
    }, BOOTSTRAP_TIMEOUT_MS);

    return () => {
      active = false;
      clearTimeout(hardTimeout);
    };
  }, []);

  if (loading || !ready) {
    return <Preloader />;
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div id="page" style={{ opacity: 1, transition: 'opacity 0.4s ease' }}>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route
            path="/github"
            element={<GitHub initialData={githubBootstrap.data} initialError={githubBootstrap.error} />}
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />

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

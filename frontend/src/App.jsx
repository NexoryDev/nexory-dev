import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import GitHub from './pages/GitHub';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

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

export default function App() {
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

  return (
    <LanguageProvider>
      {!ready && <Preloader />}

      <BrowserRouter>
        <div id="page" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}>
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
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}

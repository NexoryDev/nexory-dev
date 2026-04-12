import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Preloader from './components/Preloader';
import Home from './pages/Home';
import GitHub from './pages/GitHub';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';
import Privacy from './pages/Privacy';

export default function App() {
  const [ready, setReady] = useState(false);
  const [githubBootstrap, setGithubBootstrap] = useState({ data: null, error: false });

  useEffect(() => {
    let active = true;

    const minDelay = new Promise(resolve => setTimeout(resolve, 700));
    const githubLoad = fetch('/api/github.php?endpoint=dashboard')
      .then(res => {
        if (!res.ok) throw new Error('github bootstrap failed');
        return res.json();
      })
      .then(data => ({ data, error: false }))
      .catch(() => ({ data: null, error: true }));

    Promise.all([minDelay, githubLoad]).then(([, bootstrap]) => {
      if (!active) return;
      setGithubBootstrap(bootstrap);
      setReady(true);
    });

    const hardTimeout = setTimeout(() => {
      if (!active) return;
      setReady(true);
    }, 4000);

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
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route
              path="/github"
              element={<GitHub initialData={githubBootstrap.data} initialError={githubBootstrap.error} />}
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/imprint" element={<Imprint />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>

          <Footer />
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
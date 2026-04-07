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

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      {/* Preloader*/}
      {!ready && <Preloader />}

      <BrowserRouter>
        <div
          id="page"
          style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease' }}
        >
          <Navbar />

          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home"    element={<Home />}    />
            <Route path="/github"  element={<GitHub />}  />
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

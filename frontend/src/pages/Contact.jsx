import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Legal.css';

export default function Contact() {
  const { language } = useLanguage();

  const [form, setForm]     = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ ok: true,  text: data.message });
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus({ ok: false, text: data.error });
      }
    } catch {
      setStatus({ ok: false, text: 'Network error. Please try again.' });
    } finally {
      setSending(false);
    }
  }

  const labels = {
    title:    language === 'de' ? 'Kontakt'             : 'Contact',
    subtitle: language === 'de' ? 'Schreib uns eine Nachricht' : 'Send us a message',
    name:     language === 'de' ? 'Name'                : 'Name',
    message:  language === 'de' ? 'Nachricht'           : 'Message',
    send:     language === 'de' ? 'Senden'              : 'Send',
  };

  return (
    <main className="legal-page">
      <div className="legal-container">

        <header className="legal-header">
          <p className="legal-label">Get in touch</p>
          <h1 className="legal-title">{labels.title}</h1>
          <p className="legal-subtitle">{labels.subtitle}</p>
        </header>

        <section className="legal-section">
          <form onSubmit={handleSubmit} className="contact-form" noValidate>

            <div className="form-group">
              <label htmlFor="name">{labels.name}</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-Mail</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">{labels.message}</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            {status && (
              <p className={`form-status ${status.ok ? 'success' : 'error'}`}>
                {status.text}
              </p>
            )}

            <button type="submit" className="form-submit" disabled={sending}>
              {sending ? '...' : labels.send}
            </button>

          </form>
        </section>

      </div>
    </main>
  );
}

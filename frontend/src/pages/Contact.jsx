import '../styles/Legal.css';

export default function Contact() {
  return (
    <main className="legal-page">
      <div className="legal-container">

        <header className="legal-header">
          <p className="legal-label">Information</p>
          <h1 className="legal-title">Contact</h1>
          <p className="legal-subtitle">Contact Form</p>
        </header>

        <section className="legal-section">
          <p>
            Coming soon. Visit{' '}
            <a
              href="https://github.com/NexoryDev"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/NexoryDev
            </a>{' '}
            in the meantime.
          </p>
        </section>

      </div>
    </main>
  );
}
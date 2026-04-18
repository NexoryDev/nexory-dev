import '../styles/Legal.css';

const GITHUB_PROFILE_URL = 'https://github.com/NexoryDev';

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
              href={GITHUB_PROFILE_URL}
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
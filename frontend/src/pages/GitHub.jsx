import '../styles/Legal.css';

export default function GitHub() {
  return (
    <main className="legal-page">
      <div className="legal-container">

        <header className="legal-header">
          <p className="legal-label">Projects</p>
          <h1 className="legal-title">GitHub</h1>
          <p className="legal-subtitle">Our open source repositories</p>
        </header>

        <section className="legal-section">
          <p>
            Coming soon. Visit{' '}
            <a
              href="https://github.com/NexoryOrg"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/NexoryOrg
            </a>{' '}
            in the meantime.
          </p>
        </section>

      </div>
    </main>
  );
}

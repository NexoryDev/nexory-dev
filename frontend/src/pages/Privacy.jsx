import '../styles/Legal.css';

export default function Privacy() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-label">Legal</p>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">How we handle your data on nexory-dev.de</p>
        </header>

        <section className="legal-section">
          <h2>1. Overview</h2>
          <p>
            The protection of your personal data is important to us. This privacy policy explains
            what data is collected when you visit nexory-dev.de, how it is used, and what rights you
            have regarding your data.
          </p>
          <p>
            This website is operated as a personal, non-commercial open-source project. We collect
            only the minimum data necessary to operate the site.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Responsible Party (Controller)</h2>
          <p>Luca Bohnet</p>
          <p>
            <strong>E-Mail:</strong>{' '}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Data Collected Automatically</h2>

          <h3>Server Log Files</h3>
          <p>
            When you visit this website, the web server automatically stores certain technical
            information in log files. This includes:
          </p>
          <ul>
            <li>IP address (anonymized where possible)</li>
            <li>Date and time of the request</li>
            <li>URL of the requested page</li>
            <li>HTTP status code</li>
            <li>Browser type and operating system (User-Agent)</li>
            <li>Referrer URL</li>
          </ul>
          <p>
            This data is processed on the basis of Art. 6 (1)(f) GDPR (legitimate interest) to
            ensure the security and stable operation of the website. Log files are deleted after
            a maximum of 30 days unless a concrete suspicion of unlawful use requires longer
            retention.
          </p>

          <h3>Session Cookies</h3>
          <p>
            We use a technically necessary session cookie (for example a PHP session identifier)
            for server-side language handling via the <code>/api/language.php</code> endpoint.
            This cookie is required for the language session and is not used for advertising.
            No consent banner is required for technically necessary cookies.
          </p>

          <h3>Local Storage</h3>
          <p>
            This website stores small technical values in your browser's local storage:
          </p>
          <ul>
            <li><strong>language</strong> - your selected UI language (de/en)</li>
            <li><strong>home_github_stats</strong> - temporary cache of public GitHub dashboard data</li>
          </ul>
          <p>
            The GitHub cache is stored for performance reasons and expires automatically after a
            limited period (currently up to one hour). These entries do not contain contact form
            content, authentication data, or special categories of personal data.
          </p>
          <p>
            Legal basis: Art. 6 (1)(f) GDPR (legitimate interest in efficient and stable page
            delivery).
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Contact Form</h2>
          <p>
            A contact form is currently not active in this project version. If a contact form is
            introduced in a future release, this section will be updated with the exact data
            fields, processing purpose, retention period, and legal basis.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. External Services — GitHub API</h2>
          <p>
            This website displays publicly available repository information from GitHub. Depending
            on the page and request type, data is fetched via our own server-side proxy endpoint
            <code>/api/github.php</code>.
          </p>
          <p>
            For repository and contribution statistics, only publicly accessible repositories are
            evaluated.
          </p>
          <p>
            Our server retrieves the corresponding GitHub data from <code>api.github.com</code> and
            returns it to your browser. In this setup, GitHub receives the request from our server
            rather than directly from your browser.
          </p>
          <p>
            The legal basis for this processing is Art. 6 (1)(f) GDPR (legitimate interest in displaying
            publicly available open-source repository data). GitHub, Inc. participates in the EU-US Data
            Privacy Framework, which provides an adequate level of data protection pursuant to Art. 45 GDPR.
          </p>
          <p>
            No personal data entered by you in contact forms is transmitted to GitHub. Only technical
            connection data required for HTTP requests is involved.
          </p>
          <p>
            GitHub's privacy policy is available at:{' '}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
            </a>
          </p>
          <p>
            Icons used in the GitHub view are rendered from locally bundled SVG components. No
            additional external icon service is requested in your browser for this purpose.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Discord Bot — Nexory</h2>
          <p>
            NexoryDev operates a Discord bot named <strong>Nexory</strong>, built with{' '}
            <code>discord.py</code> and a MySQL database. The bot is publicly available on GitHub at{' '}
            <a
              href="https://github.com/NexoryDev/Nexory"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/NexoryDev/Nexory
            </a>
            {' '}and provides task management and calendar features within Discord servers.
          </p>

          <h3>Data Collected</h3>
          <p>
            When you interact with the Nexory bot, the following data is stored in a MySQL database
            operated by NexoryDev:
          </p>
          <ul>
            <li>
              <strong>Discord User ID</strong> — to associate personal tasks and preferences with
              your Discord account.
            </li>
            <li>
              <strong>Discord Guild (Server) ID</strong> — to associate server tasks and
              configuration with the respective guild.
            </li>
            <li>
              <strong>Task data</strong> — title, description, due date, reminder flag, tag,
              status, and priority, as entered by you when creating a task.
            </li>
            <li>
              <strong>Configuration data</strong> — your chosen bot mode and, for guilds, the
              configured reminder channel.
            </li>
          </ul>
          <p>
            Additionally, the bot uses the following Discord Gateway Intents, which grant it read
            access to certain data on the Discord platform:
          </p>
          <ul>
            <li><strong>Guilds</strong> — to access server structure and channels.</li>
            <li><strong>Members</strong> — to read Discord member information within a server.</li>
            <li><strong>Presences</strong> — to read member presence/status information.</li>
            <li><strong>Message Content</strong> — to process prefix-based commands sent in text channels.</li>
          </ul>
          <p>
            Events and errors are written to a local log file (<code>logs/discord.log</code>),
            which may contain Discord user identifiers and interaction metadata. Based on the
            current codebase, no automatic log deletion period is enforced in code. Log retention
            is handled operationally by the project maintainer.
          </p>

          <h3>Purpose and Legal Basis</h3>
          <p>
            Data is processed solely to provide and operate the bot's features (task management,
            reminders, calendar). The legal basis is Art. 6 (1)(b) GDPR (performance of a
            service/contract requested by the user).
          </p>

          <h3>Data Retention</h3>
          <p>
            Task and configuration data is stored until you or a guild administrator explicitly
            delete it via the bot's commands. No data is shared with third parties.
          </p>

          <h3>Discord as a Platform</h3>
          <p>
            The bot operates within the Discord platform, which is operated by Discord, Inc.
            (San Francisco, USA) and, for users in the EEA, by Discord Netherlands B.V.
            By using Discord, you are subject to Discord's own privacy policy, available at:{' '}
            <a
              href="https://discord.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              discord.com/privacy
            </a>
          </p>
          <p>
            Data transfers to Discord's servers in the United States are based on Discord's
            participation in the EU–US Data Privacy Framework (Art. 45 GDPR).
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Your Rights</h2>
          <p>Under the GDPR you have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Right of access</strong> (Art. 15 GDPR)</li>
            <li><strong>Right to rectification</strong> (Art. 16 GDPR)</li>
            <li><strong>Right to erasure</strong> (Art. 17 GDPR)</li>
            <li><strong>Right to restriction of processing</strong> (Art. 18 GDPR)</li>
            <li><strong>Right to data portability</strong> (Art. 20 GDPR)</li>
            <li><strong>Right to object</strong> (Art. 21 GDPR)</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>.
            You also have the right to lodge a complaint with a supervisory authority.
          </p>
          <p>
            Competent supervisory authority for Baden-Württemberg:{' '}
            <a
              href="https://www.baden-wuerttemberg.datenschutz.de"
              target="_blank"
              rel="noopener noreferrer"
            >
              Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-Württemberg
            </a>
          </p>
        </section>

        <footer className="legal-foot">
          <p>Last updated: 12 April 2026</p>
        </footer>
      </div>
    </main>
  );
}

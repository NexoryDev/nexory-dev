import "../styles/Legal.css";
import { useLanguage } from "../context/LanguageContext";

export default function Privacy() {
  const { t } = useLanguage();

  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <p className="legal-label">{t("privacy.label")}</p>
          <h1 className="legal-title">{t("privacy.title")}</h1>
          <p className="legal-subtitle">{t("privacy.subtitle")}</p>
        </header>

        <section className="legal-section">
          <h2>1. Controller</h2>
          <p>
            Luca Bohnet<br />
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>2. General Information on Data Processing</h2>
          <p>
            Protecting your personal data is important to us. We only process personal data to provide a functional
            website, operate our user account system, and ensure security and stability.
          </p>
          <p>
            The legal bases are primarily Art. 6(1)(b) GDPR (contract / pre-contractual measures) and
            Art. 6(1)(f) GDPR (legitimate interest in secure, stable, and efficient operation).
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Hosting and Server Logs</h2>
          <p>
            The website is hosted on a server in Germany. When the website is accessed, technically necessary connection
            data is processed automatically, in particular:
          </p>
          <ul>
            <li>IP address</li>
            <li>Date and time of the request</li>
            <li>Requested URL</li>
            <li>HTTP status code</li>
            <li>User-Agent (browser, operating system)</li>
            <li>Referrer URL (if provided)</li>
          </ul>
          <p>
            The processing is carried out to ensure system security and technical operation
            (Art. 6(1)(f) GDPR).
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Cookies, Local Storage and Session Storage</h2>

          <h3>Technically Required Cookie</h3>
          <ul>
            <li>
              <strong>refresh_token</strong> (httpOnly, Secure, SameSite): used for session management after successful login.
              The cookie is not readable by JavaScript.
            </li>
          </ul>

          <h3>Browser Storage</h3>
          <ul>
            <li><strong>language</strong>: selected language (de/en)</li>
            <li><strong>access_token</strong>: short-lived JWT for API authentication</li>
            <li><strong>remember_me</strong>: remembers whether "keep me signed in" was enabled</li>
            <li><strong>device_id</strong>: technical device ID for login sessions</li>
            <li><strong>home_github_stats</strong>: temporary cache of public GitHub statistics</li>
          </ul>
          <p>
            No tracking or marketing cookies are used.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. User Account and Authentication</h2>
          <p>
            When registering and using an account, we process the following data in particular:
          </p>
          <ul>
            <li><strong>Email address</strong> (required)</li>
            <li><strong>Password hash</strong> (no plaintext password)</li>
            <li><strong>Username</strong> (optional, publicly visible if set)</li>
            <li><strong>Avatar</strong> (optional)</li>
            <li><strong>Verification status</strong> and account metadata</li>
            <li><strong>Refresh token metadata</strong> (token hash, expiration time, user agent, IP, device_id)</li>
            <li><strong>GitHub username and GitHub ID</strong> (only if you voluntarily connect your account, see section 10a)</li>
          </ul>
          <p>
            Legal basis: Art. 6(1)(b) GDPR (provision of the account system).
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Two-Factor Authentication (2FA)</h2>
          <p>
            If you activate 2FA, the following additional data will be processed:
          </p>
          <ul>
            <li><strong>TOTP secret</strong> for generating time-based one-time codes</li>
            <li><strong>Backup codes</strong> in hashed form (single-use)</li>
            <li><strong>Short-lived MFA challenges</strong> during the login process</li>
          </ul>
          <p>
            The 2FA code itself is only used for verification. Backup codes are not stored in plaintext.
            Legal basis: Art. 6(1)(b) GDPR and Art. 6(1)(f) GDPR (security interest).
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Profile, Avatar and Public Profiles</h2>
          <p>
            If a username is set, a public profile may be available at <code>/user/&lt;username&gt;</code>.
            The following data may be displayed there if you have provided it:
          </p>
          <ul>
            <li><strong>Username</strong></li>
            <li><strong>Avatar</strong> (if set)</li>
            <li><strong>Member since</strong> (month and year)</li>
            <li><strong>Bio</strong> (short self-description, optional)</li>
            <li><strong>Location</strong> (optional, from a predefined list)</li>
            <li><strong>Timezone</strong> (derived from the selected location, optional)</li>
            <li><strong>Badges</strong></li>
          </ul>
          <p>
            This information is voluntary. You can change or remove it at any time in your profile.
            Legal basis: Art. 6(1)(a) GDPR (consent through active input).
          </p>
          <p>
            Avatar uploads are processed server-side, cropped to a square format (400×400 px), and stored as JPEG.
            The original filename is not saved.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Email Delivery</h2>
          <p>
            For transactional emails (e.g. verification, password reset), an external email delivery service is used.
            Your email address is processed exclusively for sending these technically necessary messages.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. GitHub Data (Public Organization Data)</h2>
          <p>
            Parts of the website display publicly available data from the GitHub API, particularly related to the
            GitHub organization <strong>NexoryDev</strong> (e.g. repositories, stars, commits, members, and project information).
          </p>
          <p>
            Requests are made through our own API endpoints. The purpose is to display public open source information
            (Art. 6(1)(f) GDPR).
          </p>
          <p>
            The organization is available at{" "}
            <a href="https://github.com/NexoryDev" target="_blank" rel="noopener noreferrer">
              https://github.com/NexoryDev
            </a>
            .
          </p>
          <p>
            GitHub is a service of GitHub, Inc. For more information on GitHub's data processing, please see
            {" "}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
            </a>
            .
          </p>
        </section>

        <section className="legal-section">
          <h2>10. GitHub Account Linking (OAuth)</h2>
          <p>
            You can voluntarily connect your GitHub account to your Nexory account to unlock GitHub-based badges
            (for example "Nexory Contributor").
          </p>
          <p>
            Only the following data from the public GitHub profile is stored permanently:
          </p>
          <ul>
            <li><strong>GitHub username</strong> (login name, publicly visible on GitHub)</li>
            <li><strong>GitHub user ID</strong> (numeric ID for unique identification)</li>
          </ul>
          <p>
            We do not request or store email addresses, private repository data, OAuth tokens, or write access to GitHub.
            The OAuth scope used is limited to <code>read:user</code>.
          </p>
          <p>
            The GitHub OAuth token issued during the connection is used only to fetch the public profile and is not
            persisted afterwards.
          </p>
          <p>
            The connection is voluntary. You can disconnect it at any time in your Nexory account settings.
            GitHub username and GitHub ID are deleted from the database immediately after disconnection.
          </p>
          <p>
            Legal basis: Art. 6(1)(a) GDPR (consent through active connection).
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Discord Bot Nexory</h2>
          <p>
            NexoryDev operates the Discord bot <strong>Nexory</strong>. The source code is publicly available at{" "}
            <a href="https://github.com/NexoryDev/Nexory" target="_blank" rel="noopener noreferrer">
              https://github.com/NexoryDev/Nexory
            </a>
            .
          </p>
          <p>
            When using the bot, the following data may be processed: Discord user ID, Discord server ID (guild ID), bot
            configurations, and content entered in commands, as far as it is required for the respective bot function.
          </p>
          <p>
            Legal basis: Art. 6(1)(b) GDPR (provision of the requested bot functions) and Art. 6(1)(f) GDPR (security,
            stability, and abuse prevention).
          </p>
          <p>
            Discord itself is an external platform provider. When using Discord, the Discord privacy policy also applies:
            {" "}
            <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">
              https://discord.com/privacy
            </a>
            .
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Retention Periods</h2>
          <ul>
            <li>Account and profile data (email, username, avatar): until account deletion</li>
            <li>Profile information (bio, location, timezone): until account change or deletion</li>
            <li>Refresh tokens: until expiration or revocation</li>
            <li>Email verification and password reset tokens: only for a limited period (a few hours)</li>
            <li>2FA backup codes: until use, regeneration, or deactivation of 2FA</li>
            <li>GitHub username and GitHub ID: until account unlinking or account deletion</li>
            <li>Discord bot data: until deletion by the user/guild admins or removal of the bot</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>13. Your Rights</h2>
          <p>You have the following rights under the GDPR:</p>
          <ul>
            <li>Right of access (Art. 15 GDPR)</li>
            <li>Right to rectification (Art. 16 GDPR)</li>
            <li>Right to erasure (Art. 17 GDPR)</li>
            <li>Right to restriction of processing (Art. 18 GDPR)</li>
            <li>Right to data portability (Art. 20 GDPR)</li>
            <li>Right to object (Art. 21 GDPR)</li>
          </ul>
          <p>
            To exercise your rights, please contact us at{" "}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2>14. Right to Lodge a Complaint with a Supervisory Authority</h2>
          <p>
            You have the right to lodge a complaint with a data protection supervisory authority if you believe that the
            processing of your personal data is not lawful.
          </p>
        </section>

        <footer className="legal-foot">
          <p>Effective date: 8 May 2026 · Version 2</p>
        </footer>
      </div>
    </main>
  );
}

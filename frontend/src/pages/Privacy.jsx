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
          <h2>1. Data Controller</h2>
          <p>
            Luca Bohnet<br />
            Vogelsangweg 3<br />
            72202 Nagold<br />
            Germany
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>2. General Information on Data Processing</h2>
          <p>
            We process personal data only to provide and operate this website, to manage user accounts, and to ensure
            security and stability.
          </p>
          <p>
            The legal bases are primarily Art. 6(1)(b) GDPR (pre-contractual and contractual measures), Art. 6(1)(a) GDPR
            (consent), and Art. 6(1)(f) GDPR (legitimate interests in secure and reliable operation).
          </p>
          <p>
            This privacy statement is intended for visitors worldwide, including users in the EU and EEA. If you are
            located in the EU/EEA, GDPR applies to you.
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Hosting and Server Log Data</h2>
          <p>
            The website is hosted on servers in Germany. When you access this website, the following technically
            necessary data is processed automatically:
          </p>
          <ul>
            <li>IP address</li>
            <li>Date and time of the request</li>
            <li>Requested URL</li>
            <li>HTTP status code</li>
            <li>User-Agent (browser and operating system)</li>
            <li>Referrer URL (if provided)</li>
          </ul>
          <p>
            The processing is necessary to ensure the availability, stability, and security of the website.
            Legal basis: Art. 6(1)(f) GDPR.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Cookies and Browser Storage</h2>

          <h3>Required Cookie</h3>
          <ul>
            <li>
              <strong>refresh_token</strong> (HttpOnly, Secure, SameSite): used for session management after login.
              This cookie cannot be accessed by JavaScript.
            </li>
          </ul>

          <h3>Browser Storage</h3>
          <ul>
            <li><strong>language</strong>: selected language (de/en)</li>
            <li><strong>access_token</strong>: short-lived JWT for API authentication</li>
            <li><strong>remember_me</strong>: remembers whether "keep me signed in" is enabled</li>
            <li><strong>device_id</strong>: technical device identifier for login sessions</li>
            <li><strong>home_github_stats</strong>: temporary cache of public GitHub statistics</li>
          </ul>
          <p>No tracking, advertising, or profiling cookies are used.</p>
        </section>

        <section className="legal-section">
          <h2>5. User Accounts and Authentication</h2>
          <p>
            The following data is processed for account registration and authentication:
          </p>
          <ul>
            <li><strong>Email address</strong> (required)</li>
            <li><strong>Password hash</strong> (stored securely, no plaintext password)</li>
            <li><strong>Username</strong> (optional, publicly visible if set)</li>
            <li><strong>Avatar</strong> (optional)</li>
            <li><strong>Verification status</strong> and account metadata</li>
            <li>
              <strong>Refresh token metadata</strong> (token hash, expiration, user agent, IP address, device ID)
            </li>
            <li><strong>GitHub username and GitHub ID</strong> (only if you voluntarily connect your GitHub account)</li>
          </ul>
          <p>Legal basis: Art. 6(1)(b) GDPR (provision of the account system).</p>
        </section>

        <section className="legal-section">
          <h2>6. Two-Factor Authentication (2FA)</h2>
          <p>If you enable 2FA, the following additional data is processed:</p>
          <ul>
            <li><strong>TOTP secret</strong> for generating time-based one-time codes</li>
            <li><strong>Backup codes</strong> in hashed form (single-use)</li>
            <li><strong>Short-lived MFA challenges</strong> during login</li>
          </ul>
          <p>
            The code is used only for verification. Backup codes are not stored in plaintext.
            Legal basis: Art. 6(1)(b) GDPR and Art. 6(1)(f) GDPR (security).
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Public Profile Data</h2>
          <p>
            If you set a username, a public profile may be available at <code>/user/&lt;username&gt;</code>. The following
            data may be shown if you provided it:
          </p>
          <ul>
            <li><strong>Username</strong></li>
            <li><strong>Avatar</strong> (if set)</li>
            <li><strong>Member since</strong> (month and year)</li>
            <li><strong>Bio</strong> (optional)</li>
            <li><strong>Location</strong> (optional, from a predefined list)</li>
            <li><strong>Timezone</strong> (optional, derived from location)</li>
            <li><strong>Badges</strong></li>
          </ul>
          <p>
            This information is voluntary and may be changed or removed at any time.
            Legal basis: Art. 6(1)(a) GDPR (consent).
          </p>
          <p>
            Uploaded avatars are processed server-side, cropped to square format (400×400 px), and stored as JPEG.
            Original filenames are not saved.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Email Delivery</h2>
          <p>
            Transactional emails such as account verification and password reset messages are sent using an external
            email delivery provider. Your email address is processed only for these necessary communications.
          </p>
          <p>Legal basis: Art. 6(1)(b) GDPR.</p>
        </section>

        <section className="legal-section">
          <h2>9. Public GitHub Data</h2>
          <p>
            This website displays publicly available GitHub data related to the organization <strong>NexoryDev</strong>.
            This includes public repository information, stars, commits, and member details.
          </p>
          <p>
            Requests are made through our own API for the purpose of displaying public open source information.
            Legal basis: Art. 6(1)(f) GDPR.
          </p>
          <p>
            The organization is available at{' '}
            <a href="https://github.com/NexoryDev" target="_blank" rel="noopener noreferrer">
              https://github.com/NexoryDev
            </a>
            . For GitHub's own data processing, see{' '}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub's privacy statement
            </a>
            .
          </p>
        </section>

        <section className="legal-section">
          <h2>10. GitHub OAuth Account Linking</h2>
          <p>
            You may voluntarily connect your GitHub account to your Nexory account to access GitHub-based badges
            and features.
          </p>
          <p>Only the following public GitHub data is stored permanently:</p>
          <ul>
            <li><strong>GitHub username</strong> (login name)</li>
            <li><strong>GitHub user ID</strong> (numeric identifier)</li>
          </ul>
          <p>
            We do not request or store GitHub email addresses, private repositories, OAuth refresh tokens, or write
            access. The OAuth scope is limited to <code>read:user</code>.
          </p>
          <p>
            The temporary GitHub OAuth token is only used to fetch the public profile and is not stored permanently.
          </p>
          <p>
            You can disconnect GitHub at any time in your account settings. GitHub username and ID are deleted after
            unlinking.
          </p>
          <p>Legal basis: Art. 6(1)(a) GDPR (consent).</p>
        </section>

        <section className="legal-section">
          <h2>11. Discord Bot</h2>
          <p>
            NexoryDev operates the Discord bot <strong>Nexory</strong>. The bot's source code is available at{' '}
            <a href="https://github.com/NexoryDev/Nexory" target="_blank" rel="noopener noreferrer">
              https://github.com/NexoryDev/Nexory
            </a>
            .
          </p>
          <p>
            When you use the bot, the following data may be processed if required for the requested bot function:
            Discord user ID, Discord server ID (guild ID), bot configuration data, and command input.
          </p>
          <p>
            Legal basis: Art. 6(1)(b) GDPR (execution of the requested service) and Art. 6(1)(f) GDPR (security and abuse
            prevention).
          </p>
          <p>
            Discord is a separate service provider. Its privacy policy also applies:
            {' '}
            <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">
              https://discord.com/privacy
            </a>
            .
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Data Security and Cross-Border Transfers</h2>
          <p>
            We implement technical and organizational measures to protect personal data against unlawful access,
            loss, and alteration.
          </p>
          <p>
            The website is hosted in Germany. If personal data is shared with providers outside the EU/EEA, we use only
            providers who offer appropriate safeguards such as EU standard contractual clauses or equivalent measures.
          </p>
        </section>

        <section className="legal-section">
          <h2>13. Retention Periods</h2>
          <ul>
            <li>Account and profile data (email, username, avatar): until account deletion</li>
            <li>Profile information (bio, location, timezone): until update or deletion</li>
            <li>Refresh tokens: until expiration or revocation</li>
            <li>Email verification and password reset tokens: for a limited period only</li>
            <li>2FA backup codes: until use, regeneration, or deactivation of 2FA</li>
            <li>GitHub username and GitHub ID: until unlinking or account deletion</li>
            <li>Discord bot data: until deletion by the user, guild admin, or removal of the bot</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>14. Your Rights</h2>
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
            To exercise your rights, please contact us at{' '}
            <a href="mailto:support@nexory-dev.de">support@nexory-dev.de</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2>15. Right to Lodge a Complaint</h2>
          <p>
            If you believe that the processing of your personal data is unlawful, you may lodge a complaint with a
            supervisory authority in the EU member state where you live, work, or where the alleged violation occurred.
          </p>
        </section>

        <section className="legal-section">
          <h2>16. Changes to This Privacy Policy</h2>
          <p>
            We may update this privacy policy from time to time. Significant changes will be published on this page with
            a new effective date.
          </p>
        </section>

        <footer className="legal-foot">
          <p>Effective date: 8 May 2026 · Version 2</p>
        </footer>
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Star, GitFork } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Github.css';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  Go: '#00ADD8',
  Rust: '#dea584',
  Shell: '#89e051',
};

const ROLE_CSS = {
  owner: 'admin',
  maintainer: 'maintain',
  contributor: 'push',
  viewer: 'pull',
};

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 365 * 86400) return `${Math.floor(diff / (30 * 86400))}mo ago`;
  return `${Math.floor(diff / (365 * 86400))}y ago`;
}

export default function GitHub({ initialData, initialError }) {
  const { t } = useLanguage();
  const [data, setData] = useState(initialData ?? null);
  const [error, setError] = useState(!!initialError);
  const [loading, setLoading] = useState(!initialData && !initialError);

  useEffect(() => {
    if (initialData || initialError) return;
    const controller = new AbortController();
    fetch('/api/github?endpoint=dashboard', { signal: controller.signal })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(d => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [initialData, initialError]);

  const org = data?.org ?? null;
  const repos = Array.isArray(data?.repos) ? data.repos : [];
  const members = Array.isArray(data?.members)
    ? data.members.filter(m => m?.type === 'User' && m?.login && !m.login.includes('[bot]'))
    : [];

  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);
  const totalCommits = members.reduce((s, m) => s + (Number(m.commits) || 0), 0);

  return (
    <div className="gh-page">
      <div className="gh-container">
        {loading && (
          <p style={{ color: 'var(--color-text-muted)' }}>{t('github.loading')}</p>
        )}
        {error && !loading && (
          <p style={{ color: 'var(--color-text-muted)' }}>{t('github.error')}</p>
        )}

        {org && (
          <div className="gh-org-header">
            {org.avatar_url && (
              <img className="gh-org-avatar" src={org.avatar_url} alt={org.login} loading="lazy" />
            )}
            <div>
              <h1 className="gh-org-name">{org.name || org.login}</h1>
              {org.description && <p className="gh-org-desc">{org.description}</p>}
              <div className="gh-org-meta">
                <span>{repos.length} {t('github.repos')}</span>
                <span>{members.length} {t('github.members_header').toLowerCase()}</span>
              </div>
              {org.html_url && (
                <a className="gh-org-link" href={org.html_url} target="_blank" rel="noopener noreferrer">
                  {t('github.visit_org')}
                </a>
              )}
            </div>
          </div>
        )}

        {(repos.length > 0 || members.length > 0) && (
          <div className="gh-stats">
            <span className="gh-stat">
              <Star size={13} />
              {totalStars} Stars
            </span>
            <span className="gh-stat">
              <GitFork size={13} />
              {totalForks} Forks
            </span>
            <span className="gh-stat">
              {totalCommits} {t('github.commits')}
            </span>
          </div>
        )}

        {repos.length > 0 && (
          <section id="repos">
            <h2 className="gh-section-title">{t('github.repos_header')}</h2>
            <div className="gh-repo-grid">
              {repos.map(repo => (
                <a
                  key={repo.name}
                  className="gh-repo-card"
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="gh-repo-top">
                    <span className="gh-repo-name">{repo.name}</span>
                    <span className="gh-repo-external">↗</span>
                  </div>
                  {repo.description && (
                    <p className="gh-repo-desc">{repo.description}</p>
                  )}
                  {repo.topics?.length > 0 && (
                    <div className="gh-topics">
                      {repo.topics.map(topic => (
                        <span key={topic} className="gh-topic">{topic}</span>
                      ))}
                    </div>
                  )}
                  <div className="gh-repo-footer">
                    {repo.language && (
                      <span className="gh-lang-badge">
                        <span
                          className="gh-lang-dot"
                          style={{ background: LANG_COLORS[repo.language] || '#8b949e' }}
                        />
                        {repo.language}
                      </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} />
                      {repo.stargazers_count || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <GitFork size={12} />
                      {repo.forks_count || 0}
                    </span>
                    {repo.updated_at && (
                      <span className="gh-updated">{relativeTime(repo.updated_at)}</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {members.length > 0 && (
          <section className="gh-members" id="members">
            <h2 className="gh-section-title">{t('github.members_header')}</h2>
            <div className="gh-members-grid">
              {members.map(member => {
                const cssRole = ROLE_CSS[member.role] || 'member';
                return (
                  <a
                    key={member.login}
                    className="gh-member-card"
                    href={member.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      className="gh-member-avatar"
                      src={member.avatar_url}
                      alt={member.login}
                      loading="lazy"
                    />
                    <div className="gh-member-info">
                      <span className="gh-member-login">{member.login}</span>
                      <span className={`gh-role-badge gh-role-badge--${cssRole}`}>
                        {t(`github.role_${cssRole}`)}
                      </span>
                    </div>
                    {member.commits > 0 && (
                      <div className="gh-member-commits">
                        <span style={{ fontWeight: 600 }}>{member.commits}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                          {t('github.commits')}
                        </span>
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
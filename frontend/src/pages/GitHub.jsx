import { useEffect, useState } from 'react';
import { SvgStar, SvgFork, SvgOpenIssue } from '../components/icons/svgs';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Github.css';

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Java: '#b07219',
  PHP: '#777bb4',
  Ruby: '#701516',
  C: '#555555',
  'C#': '#178600',
  'C++': '#f34b7d',
  Kotlin: '#A97BFF',
  Swift: '#ffac45',
  Dart: '#00B4AB',
  Rust: '#dea584',
  Go: '#00ADD8',
  Shell: '#89e051',
  Vue: '#41b883',
  SCSS: '#c6538c',
  Less: '#1d365d',
  Lua: '#000080',
  Perl: '#0298c3',
  R: '#198CE7',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Dockerfile: '#384d54',
  Astro: '#ff5d01',
  Svelte: '#ff3e00',
};

const ROLE_CSS = {
  owner: 'admin',
  maintainer: 'maintain',
  contributor: 'push',
  viewer: 'pull',
};

function relativeTime(dateStr, t) {
  if (!dateStr) return '';

  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );

  if (diff < 60) {
    return t('github.time_seconds', { count: diff });
  }

  if (diff < 3600) {
    return t('github.time_minutes', {
      count: Math.floor(diff / 60),
    });
  }

  if (diff < 86400) {
    return t('github.time_hours', {
      count: Math.floor(diff / 3600),
    });
  }

  if (diff < 30 * 86400) {
    return t('github.time_days', {
      count: Math.floor(diff / 86400),
    });
  }

  if (diff < 365 * 86400) {
    return t('github.time_months', {
      count: Math.floor(diff / (30 * 86400)),
    });
  }

  return t('github.time_years', {
    count: Math.floor(diff / (365 * 86400)),
  });
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
              <SvgStar size={13}/>
              {totalStars} {t('github.stars')}
            </span>
            <span className="gh-stat">
              <SvgFork size={13} />
              {totalForks} {t('github.forks')}
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
                      <SvgStar size={12} />
                      {repo.stargazers_count || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <SvgFork size={12} />
                      {repo.forks_count || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <SvgOpenIssue size={12} />
                      {repo.open_issues_count || 0}
                    </span>
                    {repo.updated_at && (
                      <span className="gh-updated">
                        {relativeTime(repo.updated_at, t)}
                      </span>
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
                const activeAt = member.lastActiveAt || member.last_active_at || member.updated_at || null;
                const activeText = activeAt
                  ? t('github.active_ago', { time: relativeTime(activeAt, t) })
                  : t('github.active_unknown');
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
                      <div className="gh-member-top">
                        <div className="gh-member-identity">
                          <span className="gh-member-login">{member.login}</span>
                          <span className="gh-member-external">↗</span>
                        </div>
                      </div>
                      <div className="gh-member-footer">
                        <span className={`gh-role-badge gh-role-badge--${cssRole}`}>
                          {t(`github.role_${cssRole}`)}
                        </span>
                      </div>
                      <span className="gh-member-active">{activeText}</span>
                    </div>
                    <div className="gh-member-metrics">
                      <span className="gh-member-metric">
                        <strong>{Number(member.commits) || 0}</strong>
                        <span>{t('github.commits')}</span>
                      </span>
                      <span className="gh-member-metric">
                        <strong>{Number(member.repoCount) || 0}</strong>
                        <span>{t('github.repos')}</span>
                      </span>
                    </div>
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
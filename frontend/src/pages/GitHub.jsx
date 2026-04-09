import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Github.css';

const ORG = 'NexoryDev';

const HEADERS = { Accept: 'application/vnd.github.v3+json' };

const LANG_COLORS = {
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  PHP: '#4F5D95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  TypeScript: '#2b7489',
  Java: '#b07219',
  'C++': '#f34b7d',
};

const ROLE_RANK = { admin: 1, maintain: 2, push: 3, triage: 4, pull: 5 };

export default function GitHub() {
  const { t } = useLanguage();
  const [org, setOrg]         = useState(null);
  const [repos, setRepos]     = useState([]);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers]   = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`https://api.github.com/orgs/${ORG}`, { headers: HEADERS }).then(res => res.json()),
      fetch(`https://api.github.com/orgs/${ORG}/repos?per_page=10&sort=stars`, { headers: HEADERS }).then(res => res.json()),
      fetch(`/api/github.php?endpoint=members`, { headers: HEADERS }).then(res => res.json()),
    ])
      .then(([orgData, reposData, allMembers]) => {
        if (orgData.message) throw new Error();
        setOrg(orgData);
        setRepos(reposData);

        return Promise.all(
          reposData.map(repo => Promise.all([
            fetch(`/api/github.php?endpoint=collaborators&repo=${repo.name}`, { headers: HEADERS })
              .then(r => r.json()).catch(() => []),
            fetch(`https://api.github.com/repos/${ORG}/${repo.name}/contributors`, { headers: HEADERS })
              .then(r => r.json()).catch(() => []),
          ]))
        ).then(results => {
          const allCollaborators = results.map(r => r[0]);
          const allContributors  = results.map(r => r[1]);

          const roleMap = {};
          allCollaborators.flat().forEach(c => {
            if (!c?.login) return;
            const perms = c.permissions ?? {};
            let role = 'pull';
            if (perms.admin)         role = 'admin';
            else if (perms.maintain) role = 'maintain';
            else if (perms.push)     role = 'push';
            else if (perms.triage)   role = 'triage';
            if (!roleMap[c.login] || ROLE_RANK[role] < ROLE_RANK[roleMap[c.login]]) {
              roleMap[c.login] = role;
            }
          });

          const commitMap = {};
          allContributors.flat().forEach(c => {
            if (c?.login) commitMap[c.login] = (commitMap[c.login] || 0) + c.contributions;
          });

          const repoCountMap = {};
          allCollaborators.forEach(repoCollabs => {
            repoCollabs.forEach(c => {
              if (c?.login) repoCountMap[c.login] = (repoCountMap[c.login] || 0) + 1;
            });
          });

          const enriched = allMembers.map(member => ({
            ...member,
            role: roleMap[member.login] ?? 'member',
            commits: commitMap[member.login] ?? 0,
            repoCount: repoCountMap[member.login] ?? 0,
          }));

          enriched.sort((a, b) => (ROLE_RANK[a.role] ?? 99) - (ROLE_RANK[b.role] ?? 99));
          setMembers(enriched);
        });
    })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const totalStars  = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
  const totalForks  = repos.reduce((sum, r) => sum + r.forks_count, 0);
  const langCount   = repos.map(r => r.language).filter(Boolean)
    .reduce((acc, l) => { acc[l] = (acc[l] || 0) + 1; return acc; }, {});
  const topLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0];


  function relativeTime(dateStr) {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute');
    if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour');
    if (diff < 2592000) return rtf.format(-Math.floor(diff / 86400), 'day');
    return rtf.format(-Math.floor(diff / 2592000), 'month');
  }

  if (loading) return <div className="gh-page"><p>{t('github.loading')}</p></div>;
  if (error)   return <div className="gh-page"><p>{t('github.error')}</p></div>;

  return (
    <div className="gh-page">
      <div className="gh-container">

        {org && (
          <div className="gh-org-header">
            <img src={org.avatar_url} alt={org.login} className="gh-org-avatar" />
            <div className="gh-org-info">
              <h1 className="gh-org-name">{org.name ?? org.login}</h1>
              {org.description && <p className="gh-org-desc">{org.description}</p>}
              <div className="gh-org-meta">
                <span>{org.public_repos} Repositories</span>
                <span>{org.followers} Followers </span>
              </div>
              <a href={`https://github.com/${ORG}`} target="_blank" rel="noopener noreferrer" className="gh-org-link">
                {t('github.visit_org')}
              </a>
            </div>
          </div>
        )}

        <div className="gh-stats">
          <span className="gh-stat">⭐ {totalStars} {t('github.stars')}</span>
          <span className="gh-stat">🍴 {totalForks} {t('github.forks')}</span>
          {topLanguage && <span className="gh-stat">💻 {topLanguage}</span>}
        </div>

        <section className="gh-repos">
          <h2 className="gh-section-title">Repositories</h2>
          <div className="gh-repo-grid">
            {repos.map(repo => (
              <a key={repo.id} href={repo.html_url} target="_blank" rel="noopener noreferrer" className="gh-repo-card">

                <div className="gh-repo-top">
                  <span className="gh-repo-name">{repo.name}</span>
                  <span className="gh-repo-external">↗</span>
                </div>

                {repo.description && <p className="gh-repo-desc">{repo.description}</p>}

                {repo.topics?.length > 0 && (
                  <div className="gh-topics">
                    {repo.topics.slice(0, 4).map(topic => (
                      <span key={topic} className="gh-topic">{topic}</span>
                    ))}
                  </div>
                )}

                <div className="gh-repo-stats">
                  {repo.language && (
                    <div className="gh-stat-item">
                      <span className="gh-stat-label">{t('github.repo_lang')}</span>
                      <span className="gh-lang-badge">
                        <span className="gh-lang-dot" style={{ background: LANG_COLORS[repo.language] ?? '#888' }} />
                        {repo.language}
                      </span>
                    </div>
                  )}
                  <div className="gh-stat-item">
                    <span className="gh-stat-label">{t('github.stars')}</span>
                    <span>⭐ {repo.stargazers_count}</span>
                  </div>
                  <div className="gh-stat-item">
                    <span className="gh-stat-label">{t('github.forks')}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                  <div className="gh-stat-item">
                    <span className="gh-stat-label">{t('github.issues')}</span>
                    <span>⚠️ {repo.open_issues_count}</span>
                  </div>
                  <div className="gh-stat-item">
                    <span className="gh-stat-label">{t('github.updated')}</span>
                    <span>{relativeTime(repo.updated_at)}</span>
                  </div>
                </div>

              </a>
            ))}
          </div>
        </section>
        {members.length > 0 && (
          <section className="gh-members">
            <h2 className="gh-section-title">{t('github.members_header')}</h2>
            <div className="gh-members-grid">
              {members.map(member => (
                <a key={member.id} href={member.html_url} target="_blank" rel="noopener noreferrer" className="gh-member-card">
                  <img src={member.avatar_url} alt={member.login} className="gh-member-avatar" />
                  <div className="gh-member-info">
                    <span className="gh-member-login">{member.login}</span>
                    <span className={`gh-role-badge gh-role-badge--${member.role}`}>
                      {t(`github.role_${member.role}`)}
                    </span>
                  </div>
                  <div className="gh-member-commits">
                    <span className="gh-stat-label">{t('github.commits')}</span>
                    <span>{member.commits > 0 ? member.commits : '-'}</span>
                  </div>
                  <div className="gh-member-commits">
                    <span className="gh-stat-label">{t('github.repos')}</span>
                    <span>{member.repoCount > 0 ? member.repoCount : '–'}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
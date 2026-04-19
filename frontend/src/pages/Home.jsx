import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Home.css';
import snippetData from '../data/codeSnippets.json';

const CODE_SNIPPETS = snippetData.snippets;
const SNIPPET_ORDER = snippetData.order;
const CACHE_KEY = 'home_github_stats';
const CACHE_TTL_MS = 1000 * 60 * 60;
const DEFAULT_STATS = { members: 0, repos: 0, commits: 0 };

function isHumanMember(member) {
  return member?.type === 'User' && member?.login && !member.login.includes('[bot]');
}

function calculateStats(dashboard) {
  const repos = Array.isArray(dashboard?.repos) ? dashboard.repos : [];
  const members = Array.isArray(dashboard?.members) ? dashboard.members : [];
  const humanMembers = members.filter(isHumanMember);

  return {
    members: new Set(humanMembers.map(member => member.login)).size,
    repos: repos.length,
    commits: humanMembers.reduce((sum, member) => sum + (Number(member?.commits) || 0), 0)
  };
}

function getStatsText({ loading, error, stats, t }) {
  if (loading) return t('home.stats_loading');
  if (error) return t('home.stats_error');

  return `${stats.members} ${t('home.stats_members')} · ${stats.repos} ${t('home.stats_repos')} · ${stats.commits} ${t('home.stats_commits')}`;
}

function getNextSnippetKey(currentKey) {
  const currentIndex = SNIPPET_ORDER.indexOf(currentKey);
  return SNIPPET_ORDER[(currentIndex + 1) % SNIPPET_ORDER.length];
}

function readStatsCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cache = JSON.parse(raw);
    if (!cache.timestamp || !cache?.data) return null;

    const uptodate = Date.now() - cache.timestamp < CACHE_TTL_MS;
    return uptodate ? cache.data : null;
  } catch {
    return null;
  }
}

function writeStatsCache(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        data
      })
    );
  } catch {
  }
}

export default function Home() {
  const { language, t } = useLanguage();
  const canvasRef = useRef(null);
  const outputRef = useRef(null);

  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [codeKey, setCodeKey] = useState('python');

  useEffect(() => {
    const controller = new AbortController();

    async function loadGitHubStats() {
      setLoading(true);
      setError(false);

      const cached = readStatsCache();
      if (cached) {
        setStats(cached);
        setLoading(false);
      }

      try {
        const response = await fetch('/api/github?endpoint=dashboard', {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard');
        }

        const dashboard = await response.json();
        const nextStats = calculateStats(dashboard);

        setStats(nextStats);
        writeStatsCache(nextStats);
      } catch (fetchError) {
        if (fetchError?.name !== 'AbortError' && !cached) {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    }

    loadGitHubStats();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PARTICLE_COUNT = 150;
    const CONNECTION_DIST = 200;
    const SPEED = 0.4;

    let particles = [];
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = particles.map(p => ({
        ...p,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      }));
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 1.8 + 1.2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const alpha = 1 - dist / CONNECTION_DIST;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(88, 166, 255, ${alpha * 0.6})`;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.95)';
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  useEffect(() => {
    const snippet = CODE_SNIPPETS[codeKey] || CODE_SNIPPETS.python;
    const code = snippet[language] || snippet.en;

    const TYPE_SPEED = 58;
    const WAIT_S = 20;

    let timeoutId;

    function startTyping() {
      const output = outputRef.current;
      if (!output) return;

      output.innerHTML = '';
      let index = 0;

      function type() {
        if (!outputRef.current) return;

        if (index < code.length) {
          const partial = code.slice(0, index + 1);
          const lines = partial.split('\n');

          output.innerHTML = lines
          .map((line, i) => {
            const isLast = i === lines.length - 1;
            return `<span class="code-line">${line}${isLast ? '<span class="cursor"></span>' : ''}</span>`;
          })
          .join('');

          index++;
          timeoutId = setTimeout(type, TYPE_SPEED);
        } else {
          const next = getNextSnippetKey(codeKey);
          timeoutId = setTimeout(() => setCodeKey(next), WAIT_S * 1000);
        }
      }

      type();
    }

    startTyping();

    return () => clearTimeout(timeoutId);
  }, [codeKey, language]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const element = document.getElementById(hash);
    if (!element) return;

    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }, []);

  const statsText = getStatsText({ loading, error, stats, t });
  const serviceCards = [
    {
      to: '/github#repos',
      title: t('home.service_github_header'),
      text: t('home.service_github_text'),
      cta: t('home.service_github_cta')
    },
    {
      to: '/contact#request',
      title: t('home.service_web_header'),
      text: t('home.service_web_text'),
      cta: t('home.service_web_cta')
    },
    {
      to: '/contact#support',
      title: t('home.service_support_header'),
      text: t('home.service_support_text'),
      cta: t('home.service_support_cta')
    }
  ];

  const technologyRows = [
    { label: 'Python', usage: t('home.tech_python_usage'), className: 'python', docs: 'https://docs.python.org/' },
    { label: 'JavaScript', usage: t('home.tech_javascript_usage'), className: 'javascript', docs: 'https://developer.mozilla.org/docs/Web/JavaScript' },
    { label: 'React', usage: t('home.tech_react_usage'), className: 'react', docs: 'https://react.dev/' },
    { label: 'APIs', usage: t('home.tech_api_usage'), className: 'api', docs: '' },
    { label: 'MySQL', usage: t('home.tech_mysql_usage'), className: 'mysql', docs: 'https://dev.mysql.com/doc/' }
  ];

  return (
    <div className="home-page">
      <section className="hero" id="start">
        <canvas ref={canvasRef} id="code-canvas" />

        <div className="hero-content">
          <div className="info">
            <h1>nexory-dev</h1>
            <p>{statsText}</p>
          </div>

          <div className="terminal">
            <div className="terminal-header">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="terminal-title">
                {(CODE_SNIPPETS[codeKey] || CODE_SNIPPETS.python).title}
              </span>

              <div className="terminal-tabs">
                {SNIPPET_ORDER.map(key => (
                  <button
                    key={key}
                    className={`terminal-tab${codeKey === key ? ' active' : ''}`}
                    onClick={() => setCodeKey(key)}
                  >
                    {CODE_SNIPPETS[key].title.split('.')[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="terminal-body">
              <pre id="code-output" ref={outputRef} />
            </div>
          </div>
        </div>
      </section>

      <section className="home-infos" id="infos">
        <div className="section-heading">
          <span className="section-eyebrow">{t('home.infos_eyebrow')}</span>
          <h2>{t('home.infos_header')}</h2>
          <p className="section-lead">{t('home.infos_intro')}</p>
        </div>

        <div className="trust-badges">
          <span>{t('home.trust_open')}</span>
          <span>{t('home.trust_active')}</span>
          <span>{t('home.trust_fast')}</span>
        </div>

        <div className="info-cards">
          {serviceCards.map(card => (
            <Link key={card.title} to={card.to} className="info-card">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <span className="info-card-link">{card.cta}</span>
            </Link>
          ))}
        </div>

        <div className="section-split">
          <div className="tech-stack">
            <h3>{t('home.tech_header')}</h3>
            <p className="section-box-text">{t('home.tech_intro')}</p>

            <div className="tech-table-wrap">
              <table className="tech-table">
                <thead>
                  <tr>
                    <th>{t('home.tech_col_technology')}</th>
                    <th>{t('home.tech_col_usage')}</th>
                    <th>{t('home.tech_col_docs')}</th>
                  </tr>
                </thead>
                <tbody>
                  {technologyRows.map(row => (
                    <tr key={row.label}>
                      <td>
                        <span className={`tech-badge ${row.className}`}>{row.label}</span>
                      </td>
                      <td>{row.usage}</td>
                      <td>
                        {row.docs ? (
                          <a href={row.docs} target="_blank" rel="noopener noreferrer">
                            {t('home.tech_docs_link')}
                          </a>
                        ) : (
                          <span style={{ color: '#888' }}>{t('home.tech_docs_none')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
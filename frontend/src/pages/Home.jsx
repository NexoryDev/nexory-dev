import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import ratingsData from '../data/ratings.json';
import snippetData from '../data/codeSnippets.json';
import { IconStar, IconWeb, IconApp, IconBot, IconSaas, IconAuto, IconApi, IconChevron } from '../components/icons/svgs';
import '../styles/Home.css';

const CODE_SNIPPETS = snippetData.snippets;
const SNIPPET_ORDER = snippetData.order;
const CACHE_KEY = 'home_github_stats';
const CACHE_TTL_MS = 1000 * 60 * 60;
const DEFAULT_STATS = { members: 0, repos: 0, commits: 0 };

const SERVICE_CARDS = [
  { icon: IconWeb, key: 'web' },
  { icon: IconApp, key: 'app' },
  { icon: IconBot, key: 'bot' },
  { icon: IconSaas, key: 'saas' },
  { icon: IconAuto, key: 'auto' },
  { icon: IconApi, key: 'api' },
];


function isHumanMember(member) {
  return member?.type === 'User' && member?.login && !member.login.includes('[bot]');
}

function calculateStats(dashboard) {
  const repos = Array.isArray(dashboard?.repos) ? dashboard.repos : [];
  const members = Array.isArray(dashboard?.members) ? dashboard.members : [];
  const humanMembers = members.filter(isHumanMember);
  return {
    members: new Set(humanMembers.map(m => m.login)).size,
    repos: repos.length,
    commits: humanMembers.reduce((sum, m) => sum + (Number(m?.commits) || 0), 0),
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
    return Date.now() - cache.timestamp < CACHE_TTL_MS ? cache.data : null;
  } catch {
    return null;
  }
}

function writeStatsCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
  } catch {}
}

function RatingsSection({ language, t }) {
  const ratings = ratingsData.filter(r => r.lang === language).slice(0, 6);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef();

  useEffect(() => {
    if (ratings.length < 2) return;
    intervalRef.current = setTimeout(() => {
      setCurrent((c) => (c + 1) % ratings.length);
    }, 4000);
    return () => clearTimeout(intervalRef.current);
  }, [current, ratings.length]);

  if (!ratings.length) return null;
  const r = ratings[current];
  return (
    <div className="ratings-section">
      <div className="rating-card">
        <div className="rating-stars">
          {Array.from({ length: r.stars }).map((_, i) => (
            <span key={i} className="rating-star"><IconStar /></span>
          ))}
        </div>
        <div className="typewriter-text">{r.text}</div>
        <div className="rating-author">{r.name}</div>
      </div>
      <div className="rating-dots rating-dots-outside">
        {ratings.map((_, idx) => (
          <button
            key={idx}
            className={'dot' + (idx === current ? ' active' : '')}
            aria-label={t('home.rating_aria', { count: idx + 1 })}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
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
        const response = await fetch('/api/github?endpoint=dashboard', { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to fetch dashboard');
        const dashboard = await response.json();
        const nextStats = calculateStats(dashboard);
        setStats(nextStats);
        writeStatsCache(nextStats);
      } catch (fetchError) {
        if (fetchError?.name !== 'AbortError' && !cached) setError(true);
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

    const PARTICLE_COUNT = 100;
    const CONNECTION_DIST = 180;
    const SPEED = 0.35;
    let particles = [];
    let animationId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = particles.map(p => ({ ...p, x: Math.random() * canvas.width, y: Math.random() * canvas.height }));
    }

    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: Math.random() * 1.5 + 1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
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
            ctx.strokeStyle = `rgba(0, 255, 136, ${alpha * 0.35})`;
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(123, 97, 255, 0.8)';
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

      function escapeHtml(str) {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function type() {
        if (!outputRef.current) return;
        if (index < code.length) {
          const partial = code.slice(0, index + 1);
          const lines = partial.split('\n');
          output.innerHTML = lines.map((line, i) => {
            const isLast = i === lines.length - 1;
            return `<span class="code-line">${escapeHtml(line)}${isLast ? '<span class="cursor"></span>' : ''}</span>`;
          }).join('');
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
    setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 0);
  }, []);

  const statsText = getStatsText({ loading, error, stats, t });
  const processSteps = [
    { num: '01', title: t('home.process_1_title'), desc: t('home.process_1_desc') },
    { num: '02', title: t('home.process_2_title'), desc: t('home.process_2_desc') },
    { num: '03', title: t('home.process_3_title'), desc: t('home.process_3_desc') },
  ];

  return (
    <div className="home-page">
      <section className="hero" id="start">
        <canvas ref={canvasRef} id="code-canvas" />
        <div className="hero-content">
          <div className="info">
            <h1>{t('home.hero_title')}</h1>
            <p className="hero-sub">{t('home.hero_sub')}</p>
            <div className="hero-ctas">
              <Link to="/contact#request" className="btn-accent">
                {t('home.cta_project')}
              </Link>
              <Link to="/github#repos" className="btn-ghost">
                {t('home.cta_projects')}
              </Link>
            </div>
            <p className="hero-stats">{statsText}</p>
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

          <div className="scroll-hint">
            <span>{t('home.scroll_more')}</span>
            <IconChevron />
          </div>
        </div>
      </section>

      <section className="home-infos" id="infos">
        <div className="section-heading">
          <span className="section-eyebrow">{t('home.infos_eyebrow')}</span>
          <h2>{t('home.offer_title')}</h2>
          <p className="section-lead">{t('home.offer_sub')}</p>
        </div>

        <div className="services-grid">
          {SERVICE_CARDS.map(({ icon: Icon, key }) => (
            <div key={key} className="service-card">
              <span className="service-icon"><Icon /></span>
              <h3>{t(`home.service_${key}`)}</h3>
            </div>
          ))}
        </div>

        <div className="process-section">
          <h2 className="process-title">{t('home.process_title')}</h2>
          <div className="process-steps">
            {processSteps.map(step => (
              <div key={step.num} className="process-step">
                <span className="process-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <RatingsSection language={language} t={t} />
      </section>
    </div>
  );
}
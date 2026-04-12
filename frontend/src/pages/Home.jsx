import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Home.css';
import snippetData from '../data/codeSnippets.json';

const CODE_SNIPPETS = snippetData.snippets;
const SNIPPET_ORDER = snippetData.order;
const CACHE_KEY = 'home_github_stats';
const CACHE_TTL_MS = 1000 * 60 * 60;

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

  const [stats, setStats] = useState({
    members: 0,
    repos: 0,
    commits: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [codeKey, setCodeKey] = useState('python');

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    async function loadGithubStats() {
      setLoading(true);
      setError(false);
      setFromCache(false);

      const cached = readStatsCache();
      if (cached) {
        setStats(cached);
        setFromCache(true);
        setLoading(false);
      }

      try {
        const dashboard = await fetch('/api/github.php?endpoint=dashboard', { signal })
          .then(r => {
            if (!r.ok) throw new Error('Failed to fetch dashboard');
            return r.json();
          });

        const safeRepos = Array.isArray(dashboard?.repos) ? dashboard.repos : [];
        const safeMembers = Array.isArray(dashboard?.members) ? dashboard.members : [];

        const memberSet = new Set();
        safeMembers
          .filter(m => m?.type === 'User' && m?.login && !m.login.includes('[bot]'))
          .forEach(m => memberSet.add(m.login));

        const totalCommits = safeMembers
          .filter(m => m?.type === 'User' && m?.login && !m.login.includes('[bot]'))
          .reduce((sum, m) => sum + (Number(m?.commits) || 0), 0);

        const nextStats = {
          members: memberSet.size,
          repos: safeRepos.length,
          commits: totalCommits
        };

        setStats(nextStats);
        writeStatsCache(nextStats);
        setFromCache(false);
        setError(false);
      } catch (error) {
        if (error?.name !== "AbortError") {
          const hasCache = !!readStatsCache();
          if (!hasCache) setError(true);
          else setFromCache(true);
          }
        } finally {
        setLoading(false);
        }
    }

    loadGithubStats();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

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
        y: Math.random() * canvas.height,
      }))
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
    const snippetCode = CODE_SNIPPETS[codeKey][language] || CODE_SNIPPETS[codeKey]['en'];
    const { code } = { code: snippetCode };
    const TYPE_SPEED = 58;
    const WAIT_S = 20;

    let timeoutId;

    function startTyping() {
      const output = outputRef.current;
      if (!output) return;

      output.textContent = '';
      let index = 0;

      function type() {
        if (!outputRef.current) return;

        if (index < code.length) {
          output.textContent = code.slice(0, index + 1);
          index++;
          timeoutId = setTimeout(type, TYPE_SPEED);
        } else {
          const next = SNIPPET_ORDER[(SNIPPET_ORDER.indexOf(codeKey) + 1) % SNIPPET_ORDER.length];
          timeoutId = setTimeout(() => setCodeKey(next), WAIT_S * 1000);
        }
      }

      type();
    }

    startTyping();

    return () => clearTimeout(timeoutId);
  }, [codeKey, language]);

  return (
    <div className="home-page">
      <section className="hero">
        <canvas ref={canvasRef} id="code-canvas" />

        <div className="hero-content">
          <div className="info">
            <h1>nexory-dev</h1>

            <p>
              {loading
              ? t('home.stats_loading')
              : error
              ? t('home.stats_error')
              : fromCache
              ? `${stats.members} ${t('home.stats_members')} · ${stats.repos} ${t('home.stats_repos')} · ${stats.commits} ${t('home.stats_commits')}`
              : `${stats.members} ${t('home.stats_members')} · ${stats.repos} ${t('home.stats_repos')} · ${stats.commits} ${t('home.stats_commits')}`
            }
            </p>
          </div>

          <div className="terminal">
            <div className="terminal-header">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="terminal-title">{CODE_SNIPPETS[codeKey].title}</span>
              <div className="terminal-tabs">
                {SNIPPET_ORDER.map(key => (
                  <button
                  key = {key}
                  className = {`terminal-tab${codeKey === key ? ' active' : ''}`}
                  onClick = {() => setCodeKey(key)}
                >
                  {CODE_SNIPPETS[key].title.split('.')[1]}
                </button>
              ))}
            </div>
          </div>

            <div className="terminal-body">
              <pre id="code-output" ref={outputRef} />
              <span className="cursor" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="home-infos" id="infos">
          <h2>{t('home.infos_header')}</h2>

          <Link to="/github" className="home-infos-contact">
            <h3>{t('home.infos_github_header')}</h3>
            <p>{t('home.infos_github_text')}</p>
          </Link>

          <Link to="/contact" className="home-infos-contact">
            <h3>{t('home.infos_contact_header')}</h3>
            <p>{t('home.infos_contact_text')}</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

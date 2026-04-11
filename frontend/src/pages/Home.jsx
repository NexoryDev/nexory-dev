import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Home.css';

const ORG = 'NexoryDev';
const HEADERS = { Accept: 'application/vnd.github.v3+json' };

const CODE_MAP = {
  de: `class Nexory:
    def __init__(self):
        self.name = "nexory-dev"
        self.fokus = ["Open Source", "Web", "Automatisierung"]
        self.stack = ["Python", "JavaScript", "MySQL"]

    def beitreten(self, nutzer):
        print(f"Willkommen bei {self.name}, {nutzer}!")

if __name__ == "__main__":
    org = Nexory()
    org.beitreten("Du")`,

  en: `class nexory:
    def __init__(self):
        self.name = "nexory-dev"
        self.focus = ["Open Source", "Web", "Automation"]
        self.stack = ["Python", "JavaScript", "MySQL"]

    def join(self, user):
        print(f"Welcome, {user}, to {self.name}")

if __name__ == "__main__":
    org = nexory()
    org.join("You")`
};

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

  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`https://api.github.com/orgs/${ORG}/repos?per_page=100`, { headers: HEADERS }).then(r => r.json()),
    ])
      .then(([reposData]) => {
        return Promise.all(
          reposData.map(repo =>
            Promise.all([
              fetch(`/api/github.php?endpoint=collaborators&repo=${repo.name}`).then(r => r.json()).catch(() => []),
              fetch(`https://api.github.com/repos/${ORG}/${repo.name}/contributors?per_page=100`).then(r => r.json()).catch(() => [])
            ])
          )
        ).then(results => ({ reposData, results }));
      })
      .then(({ reposData, results }) => {
        const memberSet = new Set();
        let totalCommits = 0;

        results.forEach(([collabs, contribs]) => {
          collabs.forEach(c => c?.login && memberSet.add(c.login));

          contribs.forEach(c => {
            if (c?.login) memberSet.add(c.login);
            if (c?.contributions) totalCommits += c.contributions;
          });
        });

        setStats({
          members: memberSet.size,
          repos: reposData.length,
          commits: totalCommits
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
    const CODE = CODE_MAP[language] ?? CODE_MAP['de'];
    const TYPE_SPEED = 58;
    const WAIT_MS = 20000;

    let timeoutId;

    function startTyping() {
      const output = outputRef.current;
      if (!output) return;

      output.textContent = '';
      let i = 0;

      function type() {
        if (!outputRef.current) return;

        if (i < CODE.length) {
          output.textContent = CODE.slice(0, i + 1);
          i++;
          timeoutId = setTimeout(type, TYPE_SPEED);
        } else {
          timeoutId = setTimeout(startTyping, WAIT_MS);
        }
      }

      type();
    }

    startTyping();

    return () => clearTimeout(timeoutId);
  }, [language]);

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
                : `${stats.members} ${t('home.stats_members')} · ${stats.repos} ${t('home.stats_repos')} · ${stats.commits} ${t('home.stats_commits')}`}
            </p>
          </div>

          <div className="terminal">
            <div className="terminal-header">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
              <span className="terminal-title">nexory.py</span>
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

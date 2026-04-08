import { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Home.css';

const CODE_MAP = {
  de:
`class nexory:
    def __init__(self, org_name):
        self.org = org_name
        self.people = []

    def join(self, neuer_nutzer):
        self.people.append(neuer_nutzer)
        print(f"Willkommen bei {self.org}, {neuer_nutzer}!")

if __name__ == "__main__":
    org = NexoryOrg("nexory-dev.de")
    org.join("Dein Name")
    org.run()`,

  en:
`class nexory:
    def __init__(self, org_name):
        self.org = org_name
        self.people = []

    def join(self, new_user):
        self.people.append(new_user)
        print(f"Welcome to {self.org}, {new_user}!")

if __name__ == "__main__":
    org = NexoryOrg("nexory-dev.de")
    org.join("Your Name")
    org.run()`,
};

export default function Home() {
  const { language, t } = useLanguage();
  const canvasRef = useRef(null);
  const outputRef = useRef(null);

  /* Animation Background */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    const PARTICLE_COUNT  = 150;
    const CONNECTION_DIST = 200;
    const SPEED           = 0.4;
    let   particles       = [];
    let   animationId;

    function resize() {
      canvas.width  = window.innerWidth;
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
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r:  Math.random() * 1.8 + 1.2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = 1 - dist / CONNECTION_DIST;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(88, 166, 255, ${alpha * 0.6})`;
            ctx.lineWidth   = 1;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle  = 'rgba(167, 139, 250, 0.95)';
        ctx.shadowColor = 'rgba(167, 139, 250, 0.6)';
        ctx.shadowBlur  = 6;
        ctx.fill();
        ctx.shadowBlur  = 0;
      });

      animationId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  /* Typing Animation */
  useEffect(() => {
    const CODE = CODE_MAP[language] ?? CODE_MAP['de'];

    const TYPE_SPEED = 58;
    const WAIT_MS    = 20000;
    let   timeoutId;

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
    <section className="hero">
      {/* ref={canvasRef} */}
      <canvas ref={canvasRef} id="code-canvas" />

      <div className="hero-content">
        <div className="info">
          <h1>nexory-dev</h1>
          <p>{t('home.subtext')}</p>
        </div>

        <div className="terminal">
          <div className="terminal-header">
            <span className="dot red"    />
            <span className="dot yellow" />
            <span className="dot green"  />
            <span className="terminal-title">nexory.py</span>
          </div>
          <div className="terminal-body">
            {/* ref={outputRef} */}
            <pre id="code-output" ref={outputRef} />
            <span className="cursor" />
          </div>
        </div>
      </div>
    </section>
  );
}

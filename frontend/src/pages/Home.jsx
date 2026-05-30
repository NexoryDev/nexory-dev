import { useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Boxes,
  Cloud,
  Folder,
  Shield,
  Cpu,
  Terminal,
  Layers,
  Users,
  Globe,
  ShieldCheck
} from "lucide-react";
import Hero from "../components/hero/Hero";
import "../styles/Home.css";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [highlightedId, setHighlightedId] = useState(null);

  const handleScrollDown = () => {
    const target = document.getElementById("problem");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSolutionClick = (event, id) => {
    event.preventDefault();

    const target = document.getElementById(id);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setTimeout(() => {
        setHighlightedId(id);

        setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
      }, 700);
    }
  };

  const problemCards = [
    {
      icon: Cpu,
      titleKey: "home.problem.legacy.title",
      descKey: "home.problem.legacy.desc",
      glow: "cyan-glow"
    },
    {
      icon: Terminal,
      titleKey: "home.problem.manual.title",
      descKey: "home.problem.manual.desc",
      glow: "purple-glow"
    },
    {
      icon: Layers,
      titleKey: "home.problem.scaling.title",
      descKey: "home.problem.scaling.desc",
      glow: "cyan-glow"
    }
  ];

  const solutionCards = [
    {
      id: "solution-discord",
      icon: Cloud,
      number: "01.",
      titleKey: "services.card.cloud.title",
      bullets: [
        "services.card.cloud.item1",
        "services.card.cloud.item2",
        "services.card.cloud.item3"
      ],
      glow: "cyan-glow"
    },
    {
      id: "solution-website",
      icon: Folder,
      number: "02.",
      titleKey: "services.card.ecm.title",
      bullets: [
        "services.card.ecm.item1",
        "services.card.ecm.item2",
        "services.card.ecm.item3"
      ],
      glow: "cyan-glow"
    },
    {
      id: "solution-app",
      icon: Boxes,
      number: "03.",
      titleKey: "services.card.erp.title",
      bullets: [
        "services.card.erp.item1",
        "services.card.erp.item2",
        "services.card.erp.item3"
      ],
      glow: "purple-glow"
    },
    {
      id: "solution-security",
      icon: Shield,
      number: "04.",
      titleKey: "services.card.security.title",
      bullets: [
        "services.card.security.item1",
        "services.card.security.item2",
        "services.card.security.item3"
      ],
      glow: "cyan-glow"
    },
    {
      id: "solution-support",
      icon: BrainCircuit,
      number: "05.",
      titleKey: "services.card.support.title",
      bullets: [
        "services.card.support.item1",
        "services.card.support.item2",
        "services.card.support.item3"
      ],
      glow: "purple-glow"
    }
  ];

  const techStack = [
    {
      name: "Python",
      color: "rgba(255, 223, 0, 0.4)",
      svg: (
        <svg viewBox="0 0 128 128" className="tech-logo-svg">
          <path
            fill="currentColor"
            d="M63.9 0C31.5 0 33.5 14.1 33.5 14.1l.1 14.6h31v4.4H21.3S0 30.6 0 63.9c0 33.3 18.6 32.1 18.6 32.1h11.1V80.4s-.6-18.6 18.3-18.6h31.3s17.6.3 17.6-17V18S99.6 0 63.9 0zM46.8 10.7a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2z"
          />
          <path
            fill="currentColor"
            d="M64.1 128c32.4 0 30.4-14.1 30.4-14.1l-.1-14.6h-31v-4.4h43.3S128 97.4 128 64.1c0-33.3-18.6-32.1-18.6-32.1H98.3v15.6s.6 18.6-18.3 18.6H48.7S31.1 65.9 31.1 83v26.8S28.4 128 64.1 128zM81.2 117.3a5.6 5.6 0 1 1 0-11.2 5.6 5.6 0 0 1 0 11.2z"
          />
        </svg>
      )
    },
    {
      name: "Flask",
      color: "rgba(255, 255, 255, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      )
    },
    {
      name: "discord.py",
      color: "rgba(123, 47, 255, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <path fill="currentColor" d="M20.3 5.4c-1.5-1.4-3.4-2.2-5.4-2.4l-.3.6c2 .5 3.8 1.5 5.4 2.8-1.7-1-3.6-1.6-5.7-1.8-1.5-.2-3-.2-4.5 0-2.1.2-4 .8-5.7 1.8 1.6-1.3 3.4-2.3 5.4-2.8l-.3-.6c-2 .2-3.9 1-5.4 2.4C1.3 9.4.5 13.9.9 18.3c2.4 2 5 2.7 7.4 2.7l1.5-1.9c-2.4-.7-4.5-2.1-6.1-3.9 1.8 1.1 3.8 1.8 6 2.1 1.5.2 3 .2 4.6 0 2.2-.3 4.2-1 6-2.1-1.6 1.8-3.7 3.2-6.1 3.9l1.5 1.9c2.4 0 5-.7 7.4-2.7.4-4.4-.4-8.9-3.4-12.9zM8.9 15.1c-.9 0-1.6-.8-1.6-1.8 0-1 .7-1.8 1.6-1.8s1.6.8 1.6 1.8c0 1-.7 1.8-1.6 1.8zm6.2 0c-.9 0-1.6-.8-1.6-1.8 0-1 .7-1.8 1.6-1.8s1.6.8 1.6 1.8c0 1-.7 1.8-1.6 1.8z" />
        </svg>
      )
    },
    {
      name: "React",
      color: "rgba(0, 212, 255, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <path fill="none" stroke="currentColor" strokeWidth="2" d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(90 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" strokeWidth="1.5" fill="none" transform="rotate(150 12 12)" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        </svg>
      )
    },
    {
      name: "Three.js",
      color: "rgba(255, 255, 255, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6l8-4 8 4v12l-8 4-8-4V6z" />
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M4 6l8 4 8-4M4 18l8-4 8 4" />
        </svg>
      )
    },
    {
      name: "Framer Motion",
      color: "rgba(240, 10, 180, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <path fill="currentColor" d="M12 2L2 12h10l10 10H12L2 12h10L22 2H12z" />
        </svg>
      )
    },
    {
      name: "GSAP",
      color: "rgba(136, 195, 39, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="9" cy="9" r="2.5" fill="currentColor" />
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M15 15h.01M6.5 12h11" />
        </svg>
      )
    },
    {
      name: "MySQL",
      color: "rgba(0, 117, 143, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <path
            fill="currentColor"
            d="M12 2C7.03 2 3 3.79 3 6v12c0 2.21 4.03 4 9 4s9-1.79 9-4V6c0-2.21-4.03-4-9-4zm0 2c4.42 0 7 .99 7 2s-2.58 2-7 2-7-.99-7-2 2.58-2 7-2zm0 16c-4.42 0-7-.99-7-2v-2.54C6.46 16.41 9.02 17 12 17s5.54-.59 7-1.54V18c0 1.01-2.58 2-7 2zm0-5c-4.42 0-7-.99-7-2v-2.54C6.46 11.41 9.02 12 12 12s5.54-.59 7-1.54V13c0 1.01-2.58 2-7 2zm0-5c-4.42 0-7-.99-7-2s2.58-2 7-2 7 .99 7 2-2.58 2-7 2z"
          />
        </svg>
      )
    },
    {
      name: "Redis",
      color: "rgba(216, 44, 40, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      name: "Docker",
      color: "rgba(10, 140, 230, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <path fill="currentColor" d="M2 13.5a1.5 1.5 0 0 1 1.5-1.5h17a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H3.5A1.5 1.5 0 0 1 2 17.5v-4zm4-7.5h3v3H6V6zm5 0h3v3h-3V6zm5 0h3v3h-3V6z" />
        </svg>
      )
    },
    {
      name: "Nginx",
      color: "rgba(0, 150, 50, 0.4)",
      svg: (
        <svg viewBox="0 0 24 24" className="tech-logo-svg">
          <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      )
    }
  ];

  return (
    <div className="home-page">
      <Hero onCardClick={handleSolutionClick} />

      <section className="problem-section" id="problem">
        <div className="scroll-hint-wrapper">
          <div className="scroll-down-hint" onClick={handleScrollDown}>
            <span className="scroll-mouse">
              <span className="scroll-wheel"></span>
            </span>
          </div>
        </div>
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="kicker-container">
              <span className="kicker-line-left"></span>
              <span className="section-kicker">
                {t("home.problem.kicker")}
              </span>
              <span className="kicker-line-right"></span>
            </div>
            <h2 className="section-title">
              {t("home.problem.title")}
            </h2>
          </motion.div>

          <div className="problem-grid">
            {problemCards.map(({ icon: Icon, titleKey, descKey, glow }, idx) => (
              <motion.div
                key={titleKey}
                className={`problem-card ${glow}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
              >
                <div className="card-icon-wrapper">
                  <Icon size={28} />
                </div>
                <h3 className="card-title">{t(titleKey)}</h3>
                <p className="card-desc">{t(descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div id="services" />

      <section className="solutions-section" id="solutions">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="kicker-container">
              <span className="kicker-line-left"></span>
              <span className="section-kicker">
                {t("home.solution.kicker")}
              </span>
              <span className="kicker-line-right"></span>
            </div>
            <h2 className="section-title">
              {t("home.solution.title")}
            </h2>
            <p className="section-desc">
              {t("home.solution.desc")}
            </p>
          </motion.div>

          <div className="solutions-list">
            {solutionCards.map(({ id, icon: Icon, number, titleKey, bullets, glow }, idx) => (
              <motion.div
                id={id}
                key={id}
                className={`solution-panel ${glow} ${highlightedId === id ? "highlighted" : ""}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: idx * 0.1 }}
              >
                <span className="panel-number">{number}</span>
                <div className="panel-left">
                  <div className="panel-icon-wrapper">
                    <Icon size={32} />
                  </div>
                  <h3 className="panel-title">{t(titleKey)}</h3>
                </div>
                <div className="panel-right">
                  <ul className="panel-bullets">
                    {bullets.map((bulletKey) => (
                      <li key={bulletKey}>{t(bulletKey)}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="tech-section" id="technologies">
        <div className="section-container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="kicker-container">
              <span className="kicker-line-left"></span>
              <span className="section-kicker">
                {t("home.tech.kicker")}
              </span>
              <span className="kicker-line-right"></span>
            </div>
            <h2 className="section-title">
              {t("home.tech.title")}
            </h2>
            <p className="section-desc">
              {t("home.tech.desc")}
            </p>
          </motion.div>

          <div className="tech-grid">
            {techStack.map(({ name, color, svg }, idx) => (
              <motion.div
                key={name}
                className="tech-card"
                style={{ "--tech-glow": color }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (idx % 4) * 0.08 }}
              >
                <div className="tech-svg-wrapper">
                  {svg}
                </div>
                <span className="tech-name">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="section-container">
          <div className="services-stats-bar">
            <div className="stat-item">
              <Users className="stat-icon" size={24} />
              <div className="stat-info">
                <span className="stat-number">0+</span>
                <span className="stat-label">{t("home.stats.clients")}</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <Layers className="stat-icon" size={24} />
              <div className="stat-info">
                <span className="stat-number">0+</span>
                <span className="stat-label">{t("home.stats.projects")}</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <ShieldCheck className="stat-icon" size={24} />
              <div className="stat-info">
                <span className="stat-number">99.98%</span>
                <span className="stat-label">{t("home.stats.uptime")}</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <Globe className="stat-icon" size={24} />
              <div className="stat-info">
                <span className="stat-number">1+</span>
                <span className="stat-label">{t("home.stats.countries")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
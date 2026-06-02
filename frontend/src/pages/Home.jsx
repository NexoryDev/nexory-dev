import { useState } from "react";
import { motion } from "framer-motion";
import {
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
import { IconDiscord, IconPhone, IconCloud, IconSupport, IconShield, IconPython, IconReact, IconNginx, IconDocker, IconRedis, IconMySQL, IconThreeJS, IconDiscordPy, IconFlask, IconFramerMotion, IconGSAP } from "../components/icons/svgs";

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
      icon: IconDiscord,
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
      icon: IconCloud,
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
      icon: IconPhone,
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
      icon: IconShield,
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
      icon: IconSupport,
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
      svg: IconPython()
    },
    {
      name: "Flask",
      color: "rgba(255, 255, 255, 0.4)",
      svg: IconFlask()
    },
    {
      name: "discord.py",
      color: "rgba(123, 47, 255, 0.4)",
      svg: IconDiscordPy()
    },
    {
      name: "React",
      color: "rgba(0, 212, 255, 0.4)",
      svg: IconReact()
    },
    {
      name: "Three.js",
      color: "rgba(255, 255, 255, 0.4)",
      svg: IconThreeJS()
    },
    {
      name: "Framer Motion",
      color: "rgba(240, 10, 180, 0.4)",
      svg: IconFramerMotion()
    },
    {
      name: "GSAP",
      color: "rgba(136, 195, 39, 0.4)",
      svg: IconGSAP()
    },
    {
      name: "MySQL",
      color: "rgba(0, 117, 143, 0.4)",
      svg: IconMySQL()
    },
    {
      name: "Redis",
      color: "rgba(216, 44, 40, 0.4)",
      svg: IconRedis()
    },
    {
      name: "Docker",
      color: "rgba(10, 140, 230, 0.4)",
      svg: IconDocker()
    },
    {
      name: "Nginx",
      color: "rgba(0, 150, 50, 0.4)",
      svg: IconNginx()
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
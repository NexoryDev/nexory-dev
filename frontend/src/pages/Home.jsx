import {
  BrainCircuit,
  Boxes,
  Cloud,
  Folder,
  Shield,
  ArrowRight,
  ArrowDown,
  Cpu,
  Terminal,
  Code,
  Users,
  Layers,
  Globe,
  ShieldCheck
} from "lucide-react";
import Hero from "../components/hero/Hero";
import "../styles/Home.css";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();

  const serviceCards = [
    {
      key: "cloud",
      icon: Cloud,
      number: "01.",
      title: t("services.card.cloud.title"),
      bullets: [
        t("services.card.cloud.item1"),
        t("services.card.cloud.item2"),
        t("services.card.cloud.item3"),
      ],
      glow: "cyan-glow",
    },
    {
      key: "ecm",
      icon: Folder,
      number: "02.",
      title: t("services.card.ecm.title"),
      bullets: [
        t("services.card.ecm.item1"),
        t("services.card.ecm.item2"),
        t("services.card.ecm.item3"),
      ],
      glow: "cyan-glow",
    },
    {
      key: "erp",
      icon: Boxes,
      number: "03.",
      title: t("services.card.erp.title"),
      bullets: [
        t("services.card.erp.item1"),
        t("services.card.erp.item2"),
        t("services.card.erp.item3"),
      ],
      glow: "purple-glow",
    },
    {
      key: "ai",
      icon: BrainCircuit,
      number: "04.",
      title: t("services.card.ai.title"),
      bullets: [
        t("services.card.ai.item1"),
        t("services.card.ai.item2"),
        t("services.card.ai.item3"),
      ],
      glow: "cyan-glow",
    },
    {
      key: "security",
      icon: Shield,
      number: "05.",
      title: t("services.card.security.title"),
      bullets: [
        t("services.card.security.item1"),
        t("services.card.security.item2"),
        t("services.card.security.item3"),
      ],
      glow: "purple-glow",
    },
  ];

  return (
    <div className="home-page">
      <Hero />
      <section className="services-section" id="services">
        <div className="services-top-divider">
          <svg className="services-divider-svg" viewBox="0 0 1440 60" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 H600 Q650 10 670 30 T720 50 T770 30 Q790 10 840 10 H1440" stroke="url(#divider-gradient)" strokeWidth="2" fill="none" />
            <defs>
              <linearGradient id="divider-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#7b2fff" />
              </linearGradient>
            </defs>
          </svg>
          <div 
            className="scroll-down-circle"
            onClick={() => {
              const target = document.querySelector(".services-section .section-header");
              if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            <ArrowDown className="scroll-down-arrow" size={16} />
          </div>
        </div>

        <div className="section-header">
          <div className="kicker-container">
            <span className="section-kicker">
              {t("services.kicker")}
            </span>
            <span className="kicker-line"></span>
          </div>
          <h2 className="section-title">
            {t("services.title")} <span className="highlight-gradient">{t("services.title_highlight")}</span>
          </h2>
          <p className="section-desc">
            {t("services.description")}
          </p>
        </div>

        <div className="services-grid">
          {serviceCards.map(({ icon: Icon, number, title, bullets, glow }) => (
            <div className={`service-card ${glow}`} key={title}>
              <span className="card-number">{number}</span>
              <div className="service-icon-wrapper">
                <Icon size={30} />
              </div>
              <h3 className="service-card-title">{title}</h3>
              <ul className="service-bullets">
                {bullets.map((item) => (
                  <li key={`${title}-${item}`}>{item}</li>
                ))}
              </ul>

            </div>
          ))}
        </div>

        <div className="services-stats-bar">
          <div className="stat-item">
            <Users className="stat-icon" size={24} />
            <div className="stat-info">
              <span className="stat-number">0+</span>
              <span className="stat-label">{t("services.stats.clients")}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <Layers className="stat-icon" size={24} />
            <div className="stat-info">
              <span className="stat-number">0+</span>
              <span className="stat-label">{t("services.stats.projects")}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <ShieldCheck className="stat-icon" size={24} />
            <div className="stat-info">
              <span className="stat-number">99.98%</span>
              <span className="stat-label">{t("services.stats.uptime")}</span>
            </div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <Globe className="stat-icon" size={24} />
            <div className="stat-info">
              <span className="stat-number">1+</span>
              <span className="stat-label">{t("services.stats.countries")}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
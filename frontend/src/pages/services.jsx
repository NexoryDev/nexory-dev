import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import {
  SvgAppDevelopment,
  SvgDiscordBot,
  SvgIndividualSolutions,
  SvgWebDevelopment,
} from "../components/icons/svgs";
import "../styles/services.css";

const fadeEase = [0.16, 1, 0.3, 1];

const navVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.055, delayChildren: 0.12 },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.46, ease: fadeEase },
  },
};

const serviceCardVariants = {
  hidden: { opacity: 0, y: 42 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: fadeEase, delay: index * 0.04 },
  }),
};

const serviceVisualVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: fadeEase, delay: 0.08 },
  },
};

const serviceContentVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, ease: fadeEase, delay: 0.16 },
  },
};

const services = [
  {
    id: "discord-bots",
    tone: "discord",
    icon: SvgDiscordBot,
    titleKey: "services.discord.title",
    descriptionKey: "services.discord.description",
    resultKey: "services.discord.result",
    featureKeys: [
      "services.discord.feature_1",
      "services.discord.feature_2",
      "services.discord.feature_3",
      "services.discord.feature_4",
    ],
    tags: ["discord.py", "Slash Commands", "Webhooks", "MySQL"],
  },
  {
    id: "web-development",
    tone: "web",
    icon: SvgWebDevelopment,
    titleKey: "services.web.title",
    descriptionKey: "services.web.description",
    resultKey: "services.web.result",
    featureKeys: [
      "services.web.feature_1",
      "services.web.feature_2",
      "services.web.feature_3",
      "services.web.feature_4",
    ],
    tags: ["React", "Node.js", "Python Flask", "Docker"],
  },
  {
    id: "app-development",
    tone: "app",
    icon: SvgAppDevelopment,
    titleKey: "services.app.title",
    descriptionKey: "services.app.description",
    resultKey: "services.app.result",
    featureKeys: [
      "services.app.feature_1",
      "services.app.feature_2",
      "services.app.feature_3",
      "services.app.feature_4",
    ],
    tags: ["React Native", "Expo", "Push API", "App Store"],
  },
  {
    id: "individual-solutions",
    tone: "individual",
    icon: SvgIndividualSolutions,
    titleKey: "services.individual.title",
    descriptionKey: "services.individual.description",
    resultKey: "services.individual.result",
    featureKeys: [
      "services.individual.feature_1",
      "services.individual.feature_2",
      "services.individual.feature_3",
      "services.individual.feature_4",
    ],
    tags: ["n8n", "Webhooks", "Admin Panels", "MySQL"],
  },
];

export default function Services() {
  const { t } = useLanguage();
  const [activeServiceId, setActiveServiceId] = useState(services[0].id);

  useEffect(() => {
    const sections = services.map(({ id }) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) setActiveServiceId(visible[0].target.id);
      },
      {
        rootMargin: "-34% 0px -46% 0px",
        threshold: [0.18, 0.32, 0.5, 0.72],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleServiceNavClick = (event, id) => {
    event.preventDefault();
    setActiveServiceId(id);

    const target = document.getElementById(id);
    if (!target) return;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <main className="services-page">
      <section className="services-hero">
        <motion.div
          className="services-shell services-hero__content"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: fadeEase }}
        >
          <div className="services-hero__intro">
            <span className="services-eyebrow">{t("services.hero.eyebrow")}</span>
            <h1>{t("services.hero.title_1")}</h1>
            <p>{t("services.hero.description")}</p>
          </div>

          <div className="services-hero__navigation">
            <span>{t("services.overview.label")}</span>
            <motion.nav
              className="services-jump-nav"
              aria-label={t("services.overview.label") || undefined}
              variants={navVariants}
              initial="hidden"
              animate="visible"
            >
              {services.map(({ id, icon: Icon, titleKey, tone }) => (
                <motion.a
                  key={id}
                  href={`#${id}`}
                  className={`services-jump-nav__item services-tone--${tone}${activeServiceId === id ? " is-active" : ""}`}
                  aria-current={activeServiceId === id ? "true" : undefined}
                  onClick={(event) => handleServiceNavClick(event, id)}
                  variants={navItemVariants}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                >
                  <Icon size={17} />
                  <span>{t(titleKey)}</span>
                </motion.a>
              ))}
            </motion.nav>
          </div>
        </motion.div>
      </section>

      <section id="services-overview" className="services-list" aria-labelledby="services-heading">
        <h2 id="services-heading" className="services-visually-hidden">{t("services.overview.title")}</h2>

        <div className="services-shell services-list__inner">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <motion.article
                id={service.id}
                key={service.id}
                className={`service-detail services-tone--${service.tone}`}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.24, margin: "0px 0px -12% 0px" }}
                variants={serviceCardVariants}
              >
                <motion.div className="service-detail__visual" variants={serviceVisualVariants}>
                  <span className="service-detail__number">0{index + 1}</span>
                  <div className="service-example-placeholder">
                    <div className="service-example-placeholder__heading">
                      <div className="service-detail__visual-icon"><Icon size={28} /></div>
                      <div>
                        <span>{t("services.examples.eyebrow")}</span>
                        <h4>{t("services.examples.title")}</h4>
                      </div>
                    </div>
                    <div className="service-example-placeholder__status">
                      <i />
                      {t("services.examples.status")}
                    </div>
                  </div>
                </motion.div>

                <motion.div className="service-detail__content" variants={serviceContentVariants}>
                  <span className="service-detail__label">{t("services.detail.label")} 0{index + 1}</span>
                  <h3>{t(service.titleKey)}</h3>
                  <p className="service-detail__description">{t(service.descriptionKey)}</p>
                  <p className="service-detail__result">{t(service.resultKey)}</p>

                  <h4 className="service-detail__subheading">{t("services.detail.scope")}</h4>
                  <ul className="service-detail__features">
                    {service.featureKeys.map((key) => (
                      <li key={key}><Check size={16} />{t(key)}</li>
                    ))}
                  </ul>

                  <h4 className="service-detail__subheading">{t("services.detail.technologies")}</h4>
                  <div className="service-detail__tags">
                    {service.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>

                  <Link className="service-detail__link" to="/contact">
                    {t("services.detail.cta")}
                    <ArrowRight size={15} />
                  </Link>
                </motion.div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="services-final-cta">
        <div className="services-shell services-final-cta__card">
          <span>{t("services.final.eyebrow")}</span>
          <h2>{t("services.final.title")}</h2>
          <p>{t("services.final.description")}</p>
          <Link className="services-button services-button--primary" to="/contact">
            {t("services.cta.project")}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

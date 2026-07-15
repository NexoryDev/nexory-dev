import React from "react";
import "../../styles/Me.css";
import { useLanguage } from "../../context/LanguageContext";

const Projects = () => {
  const { t } = useLanguage();

  const projects = [
    { name: t("account.products.portfolio.name"), desc: t("account.products.portfolio.desc") },
    { name: t("account.products.api.name"), desc: t("account.products.api.desc") },
    { name: t("account.products.dashboard.name"), desc: t("account.products.dashboard.desc") }
  ];

  return (
    <section className="account-panel">
      <div className="account-header">
        <p className="journey-kicker">{t("account.products.title")}</p>
        <h1 className="account-page-title">{t("account.products.title")}</h1>
        <p className="account-page-subtitle">{t("account.products.subtitle")}</p>
      </div>

      <div className="projects-grid">
        {projects.map((p, i) => (
          <article className="project-card" key={i}>
            <h3>{p.name}</h3>
            <p>{p.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Projects;

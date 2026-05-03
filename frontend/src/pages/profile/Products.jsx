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
    <div className="me-layout">
      <main className="me-content">

        <div className="projects-grid">

          {projects.map((p, i) => (
            <div className="project-card" key={i}>
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
            </div>
          ))}

        </div>

      </main>
    </div>
  );
};

export default Projects;

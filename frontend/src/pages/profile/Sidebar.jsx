import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SvgProfile, SvgSettings, SvgProducts } from "../../components/svgs";
import { useLanguage } from "../../context/LanguageContext";
import "../../styles/Me.css"

const Sidebar = ({ open, toggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const items = [
    { label: t("account.sidebar.profile"), path: "/me", icon: SvgProfile },
    { label: t("account.sidebar.products"), path: "/me/products", icon: SvgProducts },
    { label: t("account.sidebar.settings"), path: "/me/settings", icon: SvgSettings }
  ];

  return (
    <aside className={`me-sidebar ${open ? "open" : "closed"}`}>
      <div className="me-sidebar-inner">

        <div className="me-toggle" onClick={toggle}>
          ≡
        </div>

        {items.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <div
              key={item.path}
              className={`me-nav-item ${active ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon />
              {open && <span>{item.label}</span>}
            </div>
          );
        })}

      </div>
    </aside>
  );
};

export default Sidebar;

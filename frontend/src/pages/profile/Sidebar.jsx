import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SvgProfile,
  SvgSettings,
  SvgProducts,
  SvgBadges,
  SvgBilling,
  SvgOrders
} from "../../components/icons/svgs";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../auth/AuthProvider";
import "../../styles/Me.css";

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user, clearAuth } = useAuth();

  const items = [
    { label: "Mein Profil", path: "/me", icon: SvgProfile },
    { label: "Produkte", path: "/me/products", icon: SvgProducts },
    { label: "Billing", path: "/me/billing", icon: SvgBilling },
    { label: "Bestellungen", path: "/me/orders", icon: SvgOrders },
    { label: "Einstellungen", path: "/me/settings", icon: SvgSettings },
  ];

  const logout = async () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <>
      <div
        className={`dashboard-sidebar-backdrop ${open ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`dashboard-sidebar ${open ? "open" : ""}`}>
        <div className="dashboard-sidebar-profile">
          <div className="dashboard-avatar-wrap">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.username || user.email} className="dashboard-avatar" />
            ) : (
              <span className="dashboard-avatar-letter">
                {(user?.username || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="dashboard-sidebar-meta">
            <strong>{user?.username || user?.email || "Nexory User"}</strong>
            <span>{user?.email || "member@nexory.dev"}</span>
          </div>
        </div>

        <nav className="dashboard-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.path + item.label}
                type="button"
                className={`dashboard-nav-item ${active ? "active" : ""}`}
                onClick={() => {
                  onClose?.();
                  navigate(item.path);
                }}
              >
                <span className="dashboard-nav-icon"><Icon /></span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-footer">
          <button type="button" className="dashboard-nav-item dashboard-logout" onClick={logout}>
            <span className="dashboard-nav-icon">↗</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

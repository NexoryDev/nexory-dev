import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../../styles/Me.css";

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="dashboard-layout">
      <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <div className="dashboard-content">
        <button
          type="button"
          className="dashboard-mobile-toggle"
          onClick={() => setMobileSidebarOpen((prev) => !prev)}
          aria-label="Toggle dashboard navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="page-shell">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

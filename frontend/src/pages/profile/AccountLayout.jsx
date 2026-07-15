import { Outlet } from "react-router-dom";
import "../../styles/Me.css";

export default function AccountLayout() {
  return (
    <div className="dashboard-layout">
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../../styles/Me.css";

export default function AccountLayout() {
  const [open, setOpen] = useState(true);

  return (
    <div className="me-layout">
      <Sidebar open={open} toggle={() => setOpen(prev => !prev)} />

      <div className="me-content">
        <Outlet />
      </div>
    </div>
  );
}

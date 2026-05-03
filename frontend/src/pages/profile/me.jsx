import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/me.css";
import { apiFetch } from "../../api/apiClient";
import { useLanguage } from "../../context/LanguageContext";

const Me = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const loadUser = async () => {
    const data = await apiFetch("/api/profile/me");

    if (!data?.user) return navigate("/login");

    const baseUser = {
      ...data.user,
      username: data.user.username ?? data.user.email,
      avatar: data.user.avatar || null,
      badges: data.user.badges || [],
      achievements: data.user.achievements || []
    };

    setUser(baseUser);
  };

  useEffect(() => {
    loadUser();
  }, []);

  if (!user) return <div className="me-loading">{t("account.loading")}</div>;

  return (
    <div className="me-layout">
      <main className="me-content">

        <div className="me-header">
          <div className="avatar">
            {user.avatar ? (
              <img src={user.avatar} />
            ) : (
              user.email?.charAt(0) || "?"
            )}
          </div>

          <div>
            <h2>{user.username}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        <div className="me-grid">

          <div className="me-block">
            <h3>{t("account.me.badges")}</h3>
            <div className="badges">
              {user.badges.map((b, i) => (
                <span key={i} style={{ background: b.color || "#60a5fa" }}>
                  {b.name}
                </span>
              ))}
            </div>
          </div>

          <div className="me-block">
            <h3>{t("account.me.achievements")}</h3>
            <div>
              {user.achievements.map((a, i) => (
                <div key={i} className="achievement">
                  {a.name}
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Me;

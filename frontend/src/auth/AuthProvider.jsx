import { createContext, useContext, useEffect, useState, useRef } from "react";

const AuthContext = createContext(null);
const API = "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshInProgress = useRef(false);
  const initialized = useRef(false);

  const setToken = async (token) => {
    setAccessToken(token);
    localStorage.setItem("access_token", token);
    await loadUser(token);
  };

  const clearAuth = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
  };

  const loadUser = async (token) => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return null;

      const data = await res.json();
      setUser(data);
      return data;
    } catch {
      return null;
    }
  };

  const refresh = async () => {
    if (refreshInProgress.current) return null;
    refreshInProgress.current = true;

    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        setAccessToken(data.access_token);
        await loadUser(data.access_token);
        return data.access_token;
      }

      clearAuth();
      return null;
    } catch {
      clearAuth();
      return null;
    } finally {
      refreshInProgress.current = false;
    }
  };

  const initAuth = async () => {
    if (initialized.current) return;
    initialized.current = true;

    setLoading(true);

    const token = localStorage.getItem("access_token");

    if (token) {
      setAccessToken(token);
      const userLoaded = await loadUser(token);

      if (!userLoaded) {
        await refresh();
      }
    } else {
      await refresh();
    }

    setLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (accessToken) refresh();
    }, 4 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "logout") {
        clearAuth();
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        setToken,
        clearAuth,
        refresh,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

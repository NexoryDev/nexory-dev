import { createContext, useContext, useEffect, useState, useRef } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "access_token";
const REMEMBER_KEY = "remember_me";

function getStorage() {
  return localStorage.getItem(REMEMBER_KEY) === "1"
    ? localStorage
    : sessionStorage;
}

function saveToken(token, rememberMe) {
  if (rememberMe) {
    localStorage.setItem(REMEMBER_KEY, "1");
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

function loadToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshInProgress = useRef(false);
  const initialized = useRef(false);

  const setToken = async (token, rememberMe = false) => {
    saveToken(token, rememberMe);
    setAccessToken(token);
    await loadUser(token);
  };

  const clearAuth = () => {
    setAccessToken(null);
    setUser(null);
    removeToken();
  };

  const loadUser = async (token) => {
    try {
      const res = await fetch(`/api/auth/me`, {
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
      const res = await fetch(`/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (data.access_token) {
        const rememberMe = localStorage.getItem(REMEMBER_KEY) === "1";
        saveToken(data.access_token, rememberMe);
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

    const token = loadToken();

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

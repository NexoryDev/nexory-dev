// Relative base – nginx proxies /api/ to backend, no hardcoded host needed
const API = "";

let isRefreshing = false;
let pendingQueue = [];

function getToken() {
  return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
}

function saveToken(token) {
  const storage = localStorage.getItem("remember_me") === "1" ? localStorage : sessionStorage;
  storage.setItem("access_token", token);
}

async function refreshToken() {
  const res = await fetch(`${API}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!data.access_token) return null;

  saveToken(data.access_token);

  window.dispatchEvent(new StorageEvent("storage", {
    key: "token_update",
    newValue: data.access_token
  }));

  return data.access_token;
}

export async function apiFetch(path, options = {}) {
  let token = getToken();

  const request = async (t) =>
    fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${t}`,
      },
      credentials: "include",
    });

  let res = await request(token);

  if (res.status !== 401) {
    return res.json().catch(() => ({}));
  }

  if (!isRefreshing) {
    isRefreshing = true;

    token = await refreshToken();

    isRefreshing = false;

    pendingQueue.forEach((cb) => cb(token));
    pendingQueue = [];
  } else {
    token = await new Promise((resolve) => {
      pendingQueue.push(resolve);
    });
  }

  if (!token) return null;

  res = await request(token);
  return res.json().catch(() => ({}));
}

import { useEffect, useState } from "react";

export default function LoginTest() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [userState, setUserState] = useState({
    loggedIn: false,
    verified: false,
    registered: false,
    verifyToken: null
  });

  const API = "http://localhost:5000";

  async function getCsrfToken() {
    const res = await fetch(`${API}/api/csrf`, {
      credentials: "include"
    });
    const data = await res.json();
    return data.csrf_token;
  }

  async function request(path, body = {}) {
    const csrfToken = await getCsrfToken();

    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken
      },
      credentials: "include",
      body: JSON.stringify(body)
    });

    const text = await res.text();

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  async function login() {
    setLoading(true);
    const res = await request("/api/auth/login", { email, password });
    setResult(res);

    if (res.status === "logged in") {
      setUserState((s) => ({ ...s, loggedIn: true }));
    }

    setLoading(false);
  }

  async function register() {
    setLoading(true);
    const res = await request("/api/auth/register", { email, password });
    setResult(res);

    if (res.verify) {
      setUserState({
        loggedIn: false,
        verified: false,
        registered: true,
        verifyToken: res.verify
      });
    }

    setLoading(false);
  }

  async function verify() {
    setLoading(true);

    const res = await fetch(`${API}/api/auth/verify/${userState.verifyToken}`);
    const data = await res.json();

    setResult(data);

    if (data.status === "verified") {
      setUserState((s) => ({ ...s, verified: true }));
    }

    setLoading(false);
  }

  async function logout() {
    setLoading(true);

    const csrf = await getCsrfToken();

    const res = await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrf
      }
    });

    const data = await res.json();
    setResult(data);

    if (data.status === "logged out") {
      setUserState({
        loggedIn: false,
        verified: false,
        registered: false,
        verifyToken: null
      });
    }

    setLoading(false);
  }

  async function testDb() {
    setLoading(true);
    const res = await fetch(`${API}/api/test-db`);
    setResult(await res.json());
    setLoading(false);
  }

  async function testUsers() {
    setLoading(true);
    const res = await fetch(`${API}/api/test-users`);
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 500, margin: "50px auto", fontFamily: "sans-serif" }}>
      <h2>Auth Debug Panel</h2>

      <div style={{ marginBottom: 10 }}>
        <b>Status:</b>{" "}
        {userState.loggedIn
          ? "Logged in"
          : userState.verified
          ? "Verified (not logged in)"
          : userState.registered
          ? "Registered (not verified)"
          : "Guest"}
      </div>

      <input
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {!userState.loggedIn && (
        <button onClick={login} disabled={loading} style={{ width: "100%", padding: 10 }}>
          Login
        </button>
      )}

      {!userState.registered && (
        <button
          onClick={register}
          disabled={loading}
          style={{ width: "100%", padding: 10, marginTop: 5 }}
        >
          Register
        </button>
      )}

      {userState.registered && !userState.verified && userState.verifyToken && (
        <button
          onClick={verify}
          disabled={loading}
          style={{ width: "100%", padding: 10, marginTop: 5 }}
        >
          Verify Account
        </button>
      )}

      {userState.loggedIn && (
        <button
          onClick={logout}
          disabled={loading}
          style={{ width: "100%", padding: 10, marginTop: 5 }}
        >
          Logout
        </button>
      )}

      <hr style={{ margin: "20px 0" }} />

      <button onClick={testDb} disabled={loading} style={{ width: "100%", padding: 10 }}>
        Test DB
      </button>

      <button onClick={testUsers} disabled={loading} style={{ width: "100%", padding: 10, marginTop: 5 }}>
        Test Users
      </button>

      {result && (
        <pre
          style={{
            marginTop: 20,
            background: "#111",
            color: "#0f0",
            padding: 10,
            whiteSpace: "pre-wrap"
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
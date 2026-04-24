import json
import os
import time
from pathlib import Path
from datetime import datetime, timedelta

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session, redirect, url_for
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from itsdangerous import URLSafeTimedSerializer
import sqlite3

from flask_dance.contrib.github import github, make_github_blueprint

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "change-me")

bcrypt = Bcrypt(app)
csrf = CSRFProtect(app)
limiter = Limiter(get_remote_address, app=app)
serializer = URLSafeTimedSerializer(app.secret_key)

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=True
)

CORS(
    app,
    resources={r"/api/*": {"origins": [
        "https://nexory-dev.de",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]}},
    supports_credentials=True,
)

GITHUB_ORG = "NexoryDev"
GITHUB_API = "https://api.github.com"
CACHE_TTL = 120
CACHE_FILE = Path(__file__).parent / "cache" / "github-dashboard.json"

SUPPORTED_LANGUAGES = {"de", "en"}
DEFAULT_LANGUAGE = "de"

github_bp = make_github_blueprint(
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
)
app.register_blueprint(github_bp, url_prefix="/login")

def get_token():
    return os.getenv("GITHUB_TOKEN", "").strip()

def get_db():
    conn = sqlite3.connect("login_db.db")
    conn.row_factory = sqlite3.Row
    return conn

def gh(path, token):
    try:
        res = requests.get(
            f"{GITHUB_API}{path}",
            headers={
                "Accept": "application/vnd.github+json",
                "Authorization": f"Bearer {token}",
                "User-Agent": "nexory-backend",
            },
            timeout=20,
        )
        data = res.json()
        if res.status_code >= 400:
            return False, {"error": str(res.status_code)}
        return True, data
    except Exception:
        return False, {"error": "github unreachable"}

def cache_read(allow_old=False):
    if not CACHE_FILE.exists():
        return None
    try:
        raw = json.loads(CACHE_FILE.read_text("utf-8"))
        age = time.time() - raw.get("generated_at", 0)
        if allow_old or age < CACHE_TTL:
            return raw.get("data")
    except Exception:
        return None

def cache_write(data):
    try:
        CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
        CACHE_FILE.write_text(
            json.dumps({"generated_at": time.time(), "data": data}, ensure_ascii=False),
            "utf-8",
        )
    except Exception:
        pass

def role_pick(a, b):
    rank = {"admin": 1, "maintain": 2, "push": 3, "triage": 4, "pull": 5}
    if not a:
        return b
    return a if rank.get(a, 9) <= rank.get(b, 9) else b

@app.after_request
def secure_headers(response):
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' https:;"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

@app.route("/api/auth/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    data = request.json
    email = data["email"]
    password = data["password"]

    if len(password) < 10:
        return {"error": "Password too weak"}, 400

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        (email, password_hash),
    )
    db.commit()

    token = serializer.dumps(email, salt="verify")
    print(f"Verify: https://localhost:5000/api/auth/verify/{token}")

    return {"status": "registered"}

@app.route("/api/auth/verify/<token>")
def verify(token):
    try:
        email = serializer.loads(token, salt="verify", max_age=3600)
    except Exception:
        return {"error": "Invalid token"}, 400

    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE users SET email_verified=1 WHERE email=?", (email,))
    db.commit()

    return {"status": "verified"}

@app.route("/api/auth/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    data = request.json
    email = data["email"]
    password = data["password"]

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE email=?", (email,))
    user = cur.fetchone()

    if not user:
        return {"error": "Invalid credentials"}, 401

    if not user["email_verified"]:
        return {"error": "Email not verified"}, 403

    if user["locked_until"] and datetime.fromisoformat(user["locked_until"]) > datetime.utcnow():
        return {"error": "Account locked"}, 403

    if not bcrypt.check_password_hash(user["password_hash"], password):
        failed = user["failed_logins"] + 1
        lock = None

        if failed >= 5:
            lock = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
            failed = 0

        cur.execute(
            "UPDATE users SET failed_logins=?, locked_until=? WHERE id=?",
            (failed, lock, user["id"]),
        )
        db.commit()

        return {"error": "Invalid credentials"}, 401

    cur.execute(
        "UPDATE users SET failed_logins=0, locked_until=NULL WHERE id=?",
        (user["id"],),
    )
    db.commit()

    session.clear()
    session["user_id"] = user["id"]

    return {"status": "logged in"}

@app.route("/api/auth/forgot", methods=["POST"])
def forgot():
    email = request.json["email"]
    token = serializer.dumps(email, salt="reset")
    print(f"Reset: http://localhost:3000/reset/{token}")
    return {"status": "ok"}

@app.route("/api/auth/reset/<token>", methods=["POST"])
def reset(token):
    try:
        email = serializer.loads(token, salt="reset", max_age=1800)
    except Exception:
        return {"error": "Invalid token"}, 400

    password = request.json["password"]
    hash_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE users SET password_hash=? WHERE email=?", (hash_pw, email))
    db.commit()

    return {"status": "updated"}

@app.route("/api/auth/github")
def github_login():
    if not github.authorized:
        return redirect(url_for("github.login"))

    resp = github.get("/user")
    data = resp.json()

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE github_id=?", (data["id"],))
    user = cur.fetchone()

    if not user:
        cur.execute(
            "INSERT INTO users (github_id, username, avatar_url) VALUES (?, ?, ?)",
            (data["id"], data["login"], data["avatar_url"]),
        )
        db.commit()
        user_id = cur.lastrowid
    else:
        user_id = user["id"]

    session.clear()
    session["user_id"] = user_id

    return redirect("/")

@app.route("/api/auth/github/connect")
def connect():
    if "user_id" not in session:
        return {"error": "Not logged in"}, 401

    if not github.authorized:
        return redirect(url_for("github.login"))

    resp = github.get("/user")
    data = resp.json()

    db = get_db()
    cur = db.cursor()
    cur.execute(
        "UPDATE users SET github_id=? WHERE id=?",
        (data["id"], session["user_id"]),
    )
    db.commit()

    return {"status": "connected"}

@app.route("/api/github")
def github_api():
    token = get_token()
    if not token:
        return jsonify({"error": "no token"}), 500

    ep = request.args.get("endpoint", "")

    if ep == "org":
        ok, data = gh(f"/orgs/{GITHUB_ORG}", token)
        return jsonify(data), (200 if ok else 502)

    if ep == "repos":
        per_page = min(max(int(request.args.get("per_page", 100)), 1), 100)
        sort = request.args.get("sort", "updated")
        if sort not in {"created", "updated", "pushed", "full_name"}:
            sort = "updated"

        ok, data = gh(
            f"/orgs/{GITHUB_ORG}/repos?type=public&per_page={per_page}&sort={sort}",
            token,
        )
        return jsonify(data if ok else data), (200 if ok else 502)

    if ep == "members":
        ok, data = gh(f"/orgs/{GITHUB_ORG}/members?per_page=100", token)
        return jsonify(data), (200 if ok else 502)

    if ep == "dashboard":
        return dashboard(token)

    return jsonify({"error": "invalid endpoint"}), 400

def dashboard(token):
    cached = cache_read()
    if cached:
        return jsonify(cached), 200

    ok, org = gh(f"/orgs/{GITHUB_ORG}", token)
    if not ok:
        fallback = cache_read(True)
        if fallback:
            return jsonify(fallback), 200
        return jsonify(org), 502

    ok, repos = gh(
        f"/orgs/{GITHUB_ORG}/repos?type=public&per_page=100&sort=updated",
        token,
    )
    if not ok:
        return jsonify(repos), 502

    repos = [r for r in repos if not r.get("private") and r.get("name") != ".github"]
    repos.sort(key=lambda r: r.get("stargazers_count", 0), reverse=True)
    top = repos[:10]

    ok, members = gh(f"/orgs/{GITHUB_ORG}/members?per_page=100", token)
    if not ok:
        return jsonify(members), 502

    roles = {}
    commits = {}
    repo_counts = {}

    for repo in top:
        name = repo.get("name")
        if not name:
            continue

        ok, collabs = gh(f"/repos/{GITHUB_ORG}/{name}/collaborators?per_page=100", token)
        if ok:
            for c in collabs:
                login = c.get("login")
                if not login:
                    continue

                p = c.get("permissions", {})
                r = "pull"
                if p.get("admin"):
                    r = "admin"
                elif p.get("maintain"):
                    r = "maintain"
                elif p.get("push"):
                    r = "push"
                elif p.get("triage"):
                    r = "triage"

                roles[login] = role_pick(roles.get(login), r)
                repo_counts[login] = repo_counts.get(login, 0) + 1

        ok, contribs = gh(f"/repos/{GITHUB_ORG}/{name}/contributors?per_page=100", token)
        if ok:
            for c in contribs:
                login = c.get("login")
                if login:
                    commits[login] = commits.get(login, 0) + c.get("contributions", 0)

    rank = {"admin": 1, "maintain": 2, "push": 3, "triage": 4, "pull": 5}

    enriched = []
    for m in members:
        login = m.get("login")
        if not login:
            continue
        m["role"] = roles.get(login, "member")
        m["commits"] = commits.get(login, 0)
        m["repoCount"] = repo_counts.get(login, 0)
        enriched.append(m)

    enriched.sort(key=lambda x: rank.get(x.get("role", ""), 99))

    payload = {"org": org, "repos": top, "members": enriched}
    cache_write(payload)

    return jsonify(payload), 200

@app.route("/api/language", methods=["GET", "POST", "OPTIONS"])
def language():
    if request.method == "OPTIONS":
        return "", 204

    if request.method == "GET":
        lang = session.get("language", DEFAULT_LANGUAGE)
        if lang not in SUPPORTED_LANGUAGES:
            lang = DEFAULT_LANGUAGE
        return jsonify({"language": lang})

    body = request.get_json(silent=True) or {}
    lang = str(body.get("language", "")).lower().strip()

    if lang not in SUPPORTED_LANGUAGES:
        return jsonify({"error": "invalid"}), 400

    session["language"] = lang
    return jsonify({"language": lang})

if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=5000, debug=debug)

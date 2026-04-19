import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "change-me")

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


def get_token():
    return os.getenv("GITHUB_TOKEN", "").strip()


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
            return False, {"error": f"{res.status_code}"}
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


@app.route("/api/github")
def github():
    token = get_token()
    if not token:
        return jsonify({"error": "no token"}), 500

    ep = request.args.get("endpoint", "")

    if ep == "org":
        ok, data = gh(f"/orgs/{GITHUB_ORG}", token)
        return jsonify(data), (200 if ok else 502)

    if ep == "repos":
        try:
            per_page = int(request.args.get("per_page", 100))
        except ValueError:
            return jsonify({"error": "invalid per_page"}), 400

        per_page = max(1, min(per_page, 100))
        sort = request.args.get("sort", "updated")
        if sort not in {"created", "updated", "pushed", "full_name"}:
            sort = "updated"

        ok, data = gh(
            f"/orgs/{GITHUB_ORG}/repos?type=public&per_page={per_page}&sort={sort}",
            token,
        )
        if not ok:
            return jsonify(data), 502

        return jsonify([r for r in data if not r.get("private") and r.get("name") != ".github"]), 200

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
                if p.get("admin"):
                    r = "admin"
                elif p.get("maintain"):
                    r = "maintain"
                elif p.get("push"):
                    r = "push"
                elif p.get("triage"):
                    r = "triage"
                else:
                    r = "pull"

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
        return jsonify({"language": lang}), 200

    if request.method == "POST":
        body = request.get_json(silent=True) or {}
        lang = str(body.get("language", "")).lower().strip()

        if lang not in SUPPORTED_LANGUAGES:
            return jsonify({"error": "invalid"}), 400

        session["language"] = lang
        return jsonify({"language": lang}), 200

    return jsonify({"error": "method not allowed"}), 405


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=5000, debug=debug)

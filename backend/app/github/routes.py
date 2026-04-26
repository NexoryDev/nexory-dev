from flask import Blueprint, request, jsonify

from app.github.service import gh, get_token, GITHUB_ORG, sort_repos_by_stars, extract_commits
from app.github.cache import cache_read, cache_write

github_bp = Blueprint("github", __name__)


@github_bp.route("/github")
def github():
    token = get_token()
    if not token:
        return jsonify({"error": "no token"}), 500

    ep = request.args.get("endpoint", "")

    if ep == "org":
        ok, data = gh(f"/orgs/{GITHUB_ORG}", token)
        return jsonify(data), (200 if ok else 502)

    if ep == "repos":
        ok, data = gh(f"/orgs/{GITHUB_ORG}/repos?per_page=100", token)

        if not ok:
            return jsonify(data), 502

        data = [
            r for r in data
            if not r.get("private") and r.get("name") != ".github"
        ]

        data = sort_repos_by_stars(data)

        return jsonify(data), 200

    if ep == "members":
        ok, data = gh(f"/orgs/{GITHUB_ORG}/members?per_page=100", token)
        return jsonify(data), (200 if ok else 502)

    if ep == "dashboard":
        cached = cache_read()
        if cached:
            return jsonify(cached), 200

        ok, org = gh(f"/orgs/{GITHUB_ORG}", token)
        if not ok:
            fallback = cache_read(True)
            if fallback:
                return jsonify(fallback), 200
            return jsonify(org), 502

        ok, repos = gh(f"/orgs/{GITHUB_ORG}/repos?per_page=100", token)
        if not ok:
            return jsonify(repos), 502

        repos = [
            r for r in repos
            if not r.get("private") and r.get("name") != ".github"
        ]

        repos = sort_repos_by_stars(repos)
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

            ok, contribs = gh(
                f"/repos/{GITHUB_ORG}/{name}/contributors?per_page=100",
                token
            )

            if ok:
                repo_commits = extract_commits(contribs)

                for user, count in repo_commits.items():
                    commits[user] = commits.get(user, 0) + count

            ok, collabs = gh(
                f"/repos/{GITHUB_ORG}/{name}/collaborators?per_page=100",
                token
            )

            if ok:
                for c in collabs:
                    login = c.get("login")
                    if login:
                        repo_counts[login] = repo_counts.get(login, 0) + 1

        enriched = []

        for m in members:
            login = m.get("login")
            if not login:
                continue

            m["commits"] = commits.get(login, 0)
            m["repoCount"] = repo_counts.get(login, 0)
            enriched.append(m)

        payload = {
            "org": org,
            "repos": top,
            "members": enriched
        }

        cache_write(payload)

        return jsonify(payload), 200

    return jsonify({"error": "invalid endpoint"}), 400

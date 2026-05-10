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
        last_activity_at = {}

        def track_activity(login, timestamp):
            if not login or not timestamp:
                return

            current = last_activity_at.get(login)

            if not current or timestamp > current:
                last_activity_at[login] = timestamp

        ok, issue_comments = gh(
            f"/orgs/{GITHUB_ORG}/issues/comments?per_page=100",
            token
        )

        if ok:
            for comment in issue_comments:
                user = comment.get("user") or {}
                track_activity(user.get("login"), comment.get("created_at"))

        for repo in top:
            name = repo.get("name")
            if not name:
                continue

            ok, repo_issues = gh(
                f"/repos/{GITHUB_ORG}/{name}/issues?state=all&per_page=50",
                token
            )

            if ok:
                for issue in repo_issues:
                    if issue.get("pull_request"):
                        continue

                    author = (issue.get("user") or {}).get("login")
                    track_activity(author, issue.get("created_at"))

                    closer = (issue.get("closed_by") or {}).get("login")
                    track_activity(closer, issue.get("closed_at"))

            ok, pulls = gh(
                f"/repos/{GITHUB_ORG}/{name}/pulls?state=all&per_page=50",
                token
            )

            if ok:
                for pr in pulls:
                    track_activity((pr.get("user") or {}).get("login"), pr.get("created_at"))
                    track_activity((pr.get("merged_by") or {}).get("login"), pr.get("merged_at"))

            ok, pr_comments = gh(
                f"/repos/{GITHUB_ORG}/{name}/pulls/comments?per_page=100",
                token
            )

            if ok:
                for comment in pr_comments:
                    reviewer = (comment.get("user") or {}).get("login")
                    track_activity(reviewer, comment.get("created_at"))

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
                    perms = c.get("permissions", {})

                    if not login:
                        continue

                    if perms.get("admin"):
                        role = "owner"
                    elif perms.get("maintain"):
                        role = "maintainer"
                    elif perms.get("push"):
                        role = "contributor"
                    else:
                        role = "viewer"

                    current = roles.get(login)

                    priority = {
                        "owner": 4,
                        "maintainer": 3,
                        "contributor": 2,
                        "viewer": 1
                    }

                    if not current or priority[role] > priority.get(current, 0):
                        roles[login] = role

                    repo_counts[login] = repo_counts.get(login, 0) + 1

        enriched = []

        for m in members:
            login = m.get("login")
            if not login:
                continue

            m["commits"] = commits.get(login, 0)
            m["repoCount"] = repo_counts.get(login, 0)
            m["role"] = roles.get(login)
            m["lastActiveAt"] = last_activity_at.get(login)
            enriched.append(m)

        payload = {
            "org": org,
            "repos": top,
            "members": enriched
        }

        cache_write(payload)

        return jsonify(payload), 200

    return jsonify({"error": "invalid endpoint"}), 400

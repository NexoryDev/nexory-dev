import os
import requests

GITHUB_ORG = "NexoryDev"
GITHUB_API = "https://api.github.com"


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

        if res.status_code >= 400:
            return False, {"error": res.text}

        return True, res.json()

    except Exception:
        return False, {"error": "github unreachable"}


def sort_repos_by_stars(repos):
    return sorted(
        repos,
        key=lambda r: r.get("stargazers_count") or 0,
        reverse=True
    )


def extract_commits(contributors):
    commits = {}

    if not isinstance(contributors, list):
        return commits

    for c in contributors:
        login = c.get("login")
        if login:
            commits[login] = commits.get(login, 0) + int(c.get("contributions") or 0)

    return commits

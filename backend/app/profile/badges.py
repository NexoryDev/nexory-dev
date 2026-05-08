import json
from datetime import datetime, timezone
from app.db.connection import get_db
from app.github.service import gh, get_token, GITHUB_ORG

DAY_ONE_SUPPORTER_LIMIT = 100

BADGE_DEFINITIONS = {
    "day_one_supporter": {
        "id":          "day_one_supporter",
        "name":        "Day One Supporter",
        "description": "badge.desc.day_one_supporter",
        "color":       "#f59e0b",
        "rarity":      "legendary",
    },
    "nexory_contributor": {
        "id":          "nexory_contributor",
        "name":        "NexoryDev Contributor",
        "description": "badge.desc.nexory_contributor",
        "color":       "#ec4899",
        "rarity":      "epic",
    },
    "verified_dev": {
        "id":          "verified_dev",
        "name":        "Verified Dev",
        "description": "badge.desc.verified_dev",
        "color":       "#10b981",
        "rarity":      "common",
    },
}

def _load_existing_badges(user):
    raw = user.get("badges")
    if not raw:
        return {}
    try:
        badge_list = raw if isinstance(raw, list) else json.loads(raw)
        return {b["id"]: b for b in badge_list if isinstance(b, dict) and "id" in b}
    except Exception:
        return {}
    
def _check_day_one_supporter(user):
    user_id = user.get("id")
    if not user_id:
        return False

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "SELECT COUNT(*) AS rank_pos FROM users WHERE created_at < "
            "(SELECT created_at FROM users WHERE id = %s)",
            (user_id,)
        )
        row = cursor.fetchone()
        if not row:
            return False
        rank = row["rank_pos"] + 1
        return rank <= DAY_ONE_SUPPORTER_LIMIT
    except Exception:
        return False
    finally:
        db.close()

def _check_nexory_contributor(github_username, github_id):
    if not github_username or not github_id:
        return False
    
    token = get_token()
    if not token:
        return False
    
    ok, repos = gh(f"/orgs/{GITHUB_ORG}/repos?per_page=100", token)
    if not ok or not isinstance(repos, list):
        return False
    
    for repo in repos:
        if repo.get("private"):
            continue
        name = repo.get("name")
        if not name:
            continue

        ok, contributors = gh(f"/repos/{GITHUB_ORG}/{name}/contributors?per_page=100", token,)

        if not ok or not isinstance(contributors, list):
            continue

        for contributor in contributors:
            if contributor.get("login", "").lower() == github_username.lower():
                return True
    return False

def evaluate_badges(user):
    existing = _load_existing_badges(user)
    already_earned = set(existing.keys())
    newly_earned = set()

    if _check_day_one_supporter(user):
        newly_earned.add("day_one_supporter")

    if user.get("verified") and user.get("username") and user.get("avatar"):
        newly_earned.add("verified_dev")

    if _check_nexory_contributor(user.get("github_username"), user.get("github_id")):
        newly_earned.add("nexory_contributor")

    all_ids = already_earned | newly_earned
    now = datetime.now(timezone.utc).isoformat()

    badge_list = []
    for badge_id in all_ids:
        if badge_id in existing:
            badge_list.append(existing[badge_id])

        elif badge_id in BADGE_DEFINITIONS:
            badge_list.append({**BADGE_DEFINITIONS[badge_id], "earned_at": now})

    return badge_list, newly_earned - already_earned

def sync_badges(user_id):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return None, None

        badges, newly_earned = evaluate_badges(user)

        cursor.execute("UPDATE users SET badges = %s WHERE id = %s",(json.dumps(badges), user_id),)
        db.commit()

        return badges, newly_earned

    except Exception:
        db.rollback()
        return None, None

    finally:
        db.close()

def get_public_profile(username):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT username, avatar, role, badges, created_at, bio, location, timezone, github_username "
            "FROM users WHERE username = %s AND verified = 1",
            (username,),
        )
        user = cursor.fetchone()
    finally:
        db.close()

    if not user:
        return None

    raw_badges = user.get("badges")
    badges = []
    if raw_badges:
        try:
            lst = raw_badges if isinstance(raw_badges, list) else json.loads(raw_badges)
            badges = [b for b in lst if isinstance(b, dict)]
        except Exception:
            pass

    created_at = user.get("created_at")
    member_since = (
        created_at.isoformat() if hasattr(created_at, "isoformat")
        else str(created_at) if created_at
        else None
    )

    return {
        "username":     user["username"],
        "avatar":       user.get("avatar"),
        "bio":          user.get("bio"),
        "location":     user.get("location"),
        "timezone":     user.get("timezone"),
        "github_username": user.get("github_username"),
        "role":         user.get("role"),
        "badges":       badges,
        "member_since": member_since,
    }
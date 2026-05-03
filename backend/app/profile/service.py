from app.db.connection import get_db
from app.auth.tokens import create_access_token
from app.security.password import hash_password


def get_user_by_id(user_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()
    db.close()
    return user


def update_user(user_id, data):
    db = get_db()
    cursor = db.cursor()

    fields = []
    values = []

    username = data.get("username")
    avatar = data.get("avatar")

    if username is not None:
        username = username.strip()
        fields.append("username=%s")
        values.append(username if username != "" else None)

    if avatar is not None:
        avatar = avatar.strip()
        if avatar and not avatar.startswith(("http://", "https://")):
            db.close()
            return False
        fields.append("avatar=%s")
        values.append(avatar if avatar != "" else None)

    if not fields:
        db.close()
        return False

    values.append(user_id)

    query = f"UPDATE users SET {', '.join(fields)} WHERE id=%s"

    try:
        cursor.execute(query, values)
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False
    finally:
        db.close()


def serialize_user(user):
    username = user.get("username")

    if not username:
        username = user.get("email")

    return {
        "id": user["id"],
        "email": user["email"],
        "username": username,
        "avatar": user.get("avatar"),
        "role": user.get("role"),
        "badges": user.get("badges") or [],
        "achievements": user.get("achievements") or [],
        "friends": user.get("friends") or [],
        "privacy": user.get("privacy") or {
            "showEmail": False,
            "showOnline": True
        }
    }


def get_user_and_refresh_token(user_id):
    user = get_user_by_id(user_id)
    if not user:
        return None, None

    new_token = create_access_token(user_id)

    return user, new_token


def delete_user_account(user_id):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute("DELETE FROM refresh_tokens WHERE user_id=%s", (user_id,))
        cursor.execute("DELETE FROM password_resets WHERE user_id=%s", (user_id,))
        cursor.execute("DELETE FROM email_verifications WHERE user_id=%s", (user_id,))
        cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))

        db.commit()
        return cursor.rowcount > 0
    except Exception:
        db.rollback()
        return False
    finally:
        db.close()


def change_password(user_id, new_password):
    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            "UPDATE users SET password_hash=%s WHERE id=%s",
            (hash_password(new_password), user_id)
        )
        cursor.execute(
            "UPDATE refresh_tokens SET revoked=1 WHERE user_id=%s",
            (user_id,)
        )
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False
    finally:
        db.close()

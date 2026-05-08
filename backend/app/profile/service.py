import os
import uuid

from PIL import Image
from flask import current_app

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
    github_username = data.get("github_username")
    bio = data.get("bio")
    location = data.get("location")
    timezone_value = data.get("timezone")

    if username is not None:
        username = username.strip()
        if len(username) > 15:
            db.close()
            return False, "username_too_long"
        if username:
            cursor.execute(
                "SELECT id FROM users WHERE username=%s AND id!=%s",
                (username, user_id)
            )
            if cursor.fetchone():
                db.close()
                return False, "username_taken"
        fields.append("username=%s")
        values.append(username if username != "" else None)

    if avatar is not None:
        avatar = avatar.strip()
        if avatar and not avatar.startswith(("http://", "https://", "/uploads/")):
            db.close()
            return False, "invalid_avatar"
        fields.append("avatar=%s")
        values.append(avatar if avatar != "" else None)

    if github_username is not None:
        github_username = github_username.strip()
        if len(github_username) > 39:
            db.close()
            return False, "github_username_too_long"
        fields.append("github_username=%s")
        values.append(github_username if github_username != "" else None)

    if bio is not None:
        bio = bio.strip()
        if len(bio) > 280:
            db.close()
            return False, "bio_too_long"
        fields.append("bio=%s")
        values.append(bio if bio != "" else None)

    if location is not None:
        location = location.strip()
        if len(location) > 120:
            db.close()
            return False, "location_too_long"
        fields.append("location=%s")
        values.append(location if location != "" else None)

    if timezone_value is not None:
        timezone_value = timezone_value.strip()
        if len(timezone_value) > 64:
            db.close()
            return False, "timezone_too_long"
        fields.append("timezone=%s")
        values.append(timezone_value if timezone_value != "" else None)

    if not fields:
        db.close()
        return False, "no_fields"

    values.append(user_id)

    query = f"UPDATE users SET {', '.join(fields)} WHERE id=%s"

    try:
        cursor.execute(query, values)
        db.commit()
        return True, None
    except Exception:
        db.rollback()
        return False, "db_error"
    finally:
        db.close()


_ALLOWED_AVATAR_TYPES = {"jpg", "jpeg", "png", "webp"}


def upload_avatar(user_id, file):
    filename = file.filename or ""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if ext not in _ALLOWED_AVATAR_TYPES:
        return None, "invalid_file_type"

    try:
        file.stream.seek(0)
        img = Image.open(file.stream)
        img.load()
    except Exception:
        return None, "invalid_file_type"

    try:
        img = img.convert("RGB")
        w, h = img.size
        min_dim = min(w, h)
        left = (w - min_dim) // 2
        top = (h - min_dim) // 2
        img = img.crop((left, top, left + min_dim, top + min_dim))
        img = img.resize((400, 400), Image.LANCZOS)
    except Exception:
        return None, "upload_failed"

    upload_folder = current_app.config["UPLOAD_FOLDER"]

    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT avatar FROM users WHERE id=%s", (user_id,))
    row = cursor.fetchone()
    if row and row.get("avatar"):
        old = row["avatar"]
        if old.startswith("/uploads/avatars/"):
            old_path = os.path.join(upload_folder, old.rsplit("/", 1)[-1])
            if os.path.isfile(old_path):
                try:
                    os.remove(old_path)
                except OSError:
                    pass

    new_filename = uuid.uuid4().hex + ".jpg"
    save_path = os.path.join(upload_folder, new_filename)
    try:
        img.save(save_path, "JPEG", quality=85)
    except Exception:
        db.close()
        return None, "upload_failed"

    url = f"/uploads/avatars/{new_filename}"

    try:
        cursor.execute("UPDATE users SET avatar=%s WHERE id=%s", (url, user_id))
        db.commit()
        return url, None
    except Exception:
        db.rollback()
        try:
            os.remove(save_path)
        except OSError:
            pass
        return None, "db_error"
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
        "github_username": user.get("github_username"),
        "github_id": user.get("github_id"),
        "bio": user.get("bio"),
        "location": user.get("location"),
        "timezone": user.get("timezone"),
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

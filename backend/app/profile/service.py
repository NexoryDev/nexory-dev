import os
import io
import tempfile
import socket
import struct
import logging
import uuid
import shutil

from PIL import Image, ImageOps, UnidentifiedImageError
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
    allowed_assignments = {
        "username=%s",
        "avatar=%s",
        "github_username=%s",
        "bio=%s",
        "location=%s",
        "timezone=%s",
    }

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
        if avatar and not avatar.startswith("/uploads/avatars/"):
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

    if any(field not in allowed_assignments for field in fields):
        db.close()
        return False, "invalid_fields"

    values.append(user_id)

    query = f"UPDATE users SET {', '.join(fields)} WHERE id=%s"  # nosec B608

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
_ALLOWED_PIL_FORMATS = {"JPEG", "PNG", "WEBP"}

logger = logging.getLogger(__name__)


def _local_avatar_url(value):
    if isinstance(value, str) and value.startswith("/uploads/avatars/"):
        return value
    return None


def _safe_unlink(path):
    try:
        if path and os.path.isfile(path):
            os.remove(path)
    except OSError:
        pass


def _scan_avatar_bytes(raw_bytes):
    if not current_app.config.get("AVATAR_ENABLE_MALWARE_SCAN", False):
        return True

    host = current_app.config.get("AVATAR_CLAMD_HOST", "127.0.0.1")
    port = int(current_app.config.get("AVATAR_CLAMD_PORT", 3310))
    timeout_seconds = int(current_app.config.get("AVATAR_SCAN_TIMEOUT_SECONDS", 20))

    try:
        with socket.create_connection((host, port), timeout=timeout_seconds) as sock:
            sock.sendall(b"zINSTREAM\0")

            chunk_size = 8192
            for idx in range(0, len(raw_bytes), chunk_size):
                chunk = raw_bytes[idx:idx + chunk_size]
                sock.sendall(struct.pack(">I", len(chunk)))
                sock.sendall(chunk)

            sock.sendall(struct.pack(">I", 0))
            response = sock.recv(4096).decode("utf-8", errors="replace")
    except Exception as exc:
        logger.warning("Avatar malware scan failed: %s", exc)
        return False

    if "OK" in response and "FOUND" not in response:
        return True

    logger.warning(
        "Avatar malware scan rejected upload (response=%s)",
        response.strip(),
    )
    return False


def _load_avatar_image(raw_bytes):
    try:
        probe = Image.open(io.BytesIO(raw_bytes))
        detected_format = (probe.format or "").upper()
        is_animated = bool(getattr(probe, "is_animated", False)) or int(getattr(probe, "n_frames", 1)) > 1
        width, height = probe.size
    except (UnidentifiedImageError, OSError):
        return None, None, "invalid_file_type"

    if detected_format not in _ALLOWED_PIL_FORMATS:
        return None, None, "invalid_file_type"

    if is_animated:
        return None, None, "animated_not_allowed"

    min_dim = int(current_app.config.get("AVATAR_MIN_DIMENSION", 64))
    max_dim = int(current_app.config.get("AVATAR_MAX_DIMENSION", 4096))
    max_pixels = int(current_app.config.get("AVATAR_MAX_PIXELS", 12000000))

    if width < min_dim or height < min_dim:
        return None, None, "image_too_small"
    if width > max_dim or height > max_dim:
        return None, None, "image_dimensions_exceeded"
    if width * height > max_pixels:
        return None, None, "image_dimensions_exceeded"

    try:
        img = Image.open(io.BytesIO(raw_bytes))
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        return img, detected_format.lower(), None
    except Exception:
        return None, None, "upload_failed"


def upload_avatar(user_id, file):
    max_upload_bytes = int(current_app.config.get("AVATAR_MAX_UPLOAD_BYTES", 5 * 1024 * 1024))

    try:
        raw = file.stream.read(max_upload_bytes + 1)
    except Exception:
        return None, "upload_failed"

    if not raw:
        return None, "no_file"
    if len(raw) > max_upload_bytes:
        return None, "file_too_large"

    Image.MAX_IMAGE_PIXELS = int(current_app.config.get("AVATAR_MAX_PIXELS", 12000000))

    img, ext, err = _load_avatar_image(raw)
    if err:
        return None, err

    if ext not in _ALLOWED_AVATAR_TYPES:
        return None, "invalid_file_type"

    try:
        w, h = img.size
        crop_dim = min(w, h)
        left = (w - crop_dim) // 2
        top = (h - crop_dim) // 2
        output_size = int(current_app.config.get("AVATAR_OUTPUT_SIZE", 400))
        img = img.crop((left, top, left + crop_dim, top + crop_dim))
        img = img.resize((output_size, output_size), Image.Resampling.LANCZOS)
    except Exception:
        return None, "upload_failed"

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    quarantine_folder = current_app.config.get("AVATAR_QUARANTINE_FOLDER", os.path.join(upload_folder, "..", "avatar-quarantine"))
    os.makedirs(upload_folder, exist_ok=True)
    os.makedirs(quarantine_folder, exist_ok=True)

    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT avatar FROM users WHERE id=%s", (user_id,))
    row = cursor.fetchone()
    old_path = None
    if row and row.get("avatar"):
        old = row["avatar"]
        if old.startswith("/uploads/avatars/"):
            old_path = os.path.join(upload_folder, old.rsplit("/", 1)[-1])

    new_filename = uuid.uuid4().hex + ".jpg"
    save_path = os.path.join(upload_folder, new_filename)
    temp_path = None

    try:
        fd, temp_path = tempfile.mkstemp(prefix=".avatar-", suffix=".tmp", dir=quarantine_folder)
        os.close(fd)
        img.save(temp_path, "JPEG", quality=85, optimize=True, progressive=True)

        if not _scan_avatar_bytes(raw):
            _safe_unlink(temp_path)
            db.close()
            return None, "malware_detected"

        shutil.copy2(temp_path, save_path)
        _safe_unlink(temp_path)
        try:
            os.chmod(save_path, 0o640)
        except OSError:
            pass
    except Exception:
        _safe_unlink(temp_path)
        db.close()
        return None, "upload_failed"

    url = f"/uploads/avatars/{new_filename}"

    try:
        cursor.execute("UPDATE users SET avatar=%s WHERE id=%s", (url, user_id))
        db.commit()

        # Delete old avatar only after successful DB update to avoid broken profile refs.
        _safe_unlink(old_path)

        return url, None
    except Exception:
        db.rollback()
        _safe_unlink(save_path)
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
        "avatar": _local_avatar_url(user.get("avatar")),
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
    avatar_path = None

    try:
        cursor.execute("SELECT avatar FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()
        if not user:
            return False

        avatar = user.get("avatar")
        if avatar and avatar.startswith("/uploads/avatars/"):
            avatar_path = os.path.join(
                current_app.config["UPLOAD_FOLDER"],
                avatar.rsplit("/", 1)[-1],
            )

        cursor.execute("DELETE FROM refresh_tokens WHERE user_id=%s", (user_id,))
        cursor.execute("DELETE FROM password_resets WHERE user_id=%s", (user_id,))
        cursor.execute("DELETE FROM email_verifications WHERE user_id=%s", (user_id,))
        cursor.execute("DELETE FROM users WHERE id=%s", (user_id,))

        db.commit()
        _safe_unlink(avatar_path)
        return True
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

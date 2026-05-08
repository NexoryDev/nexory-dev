import json
import secrets
import string
import time
import uuid
from datetime import datetime, timedelta

import pyotp
import redis as _redis_lib

from app.db.connection import get_db
from app.auth.tokens import create_access_token, decode_access_token
from app.security.hashing import hash_token, generate_refresh_token
from app.security.password import hash_password, verify_password
from app.config import Config
from app.mailer import send_verify_mail, send_reset_mail

_DUMMY_HASH = "$2b$12$GhvMmNVjRW29ulnudl.LDuAHC8BXB3eFxRVdU4DRpBz.VUCuTe.Gm"
_MFA_TICKET_TTL_SECS = 5 * 60
_PENDING_SETUP_TTL_SECS = 10 * 60
_MAX_MFA_ATTEMPTS = 5

_mem_store: dict[str, tuple[str, float]] = {}


def _mem_set(key: str, ttl: int, value: str) -> None:
    _mem_store[key] = (value, time.monotonic() + ttl)


def _mem_get(key: str) -> str | None:
    entry = _mem_store.get(key)
    if entry is None:
        return None
    value, exp = entry
    if time.monotonic() > exp:
        _mem_store.pop(key, None)
        return None
    return value


def _mem_del(*keys: str) -> None:
    for k in keys:
        _mem_store.pop(k, None)


def _mem_incr(key: str, ttl: int) -> int:
    raw = _mem_get(key)
    count = (int(raw) if raw else 0) + 1
    _mem_set(key, ttl, str(count))
    return count


def _get_redis():
    return _redis_lib.from_url(Config.REDIS_URL, decode_responses=True)


def _redis_available() -> bool:
    try:
        _get_redis().ping()
        return True
    except Exception:
        return False


_redis_ok: bool | None = None


def _use_redis() -> bool:
    global _redis_ok
    if _redis_ok is None:
        _redis_ok = _redis_available()
        if not _redis_ok:
            import warnings
            warnings.warn(
                "Redis unavailable – using in-memory fallback for MFA/2FA state. "
                "Not suitable for production or multi-process deployments.",
                RuntimeWarning,
                stacklevel=2,
            )
    return _redis_ok


def _store_mfa_challenge(ticket, data):
    if _use_redis():
        _get_redis().setex(f"mfa:{ticket}", _MFA_TICKET_TTL_SECS, json.dumps(data))
    else:
        _mem_set(f"mfa:{ticket}", _MFA_TICKET_TTL_SECS, json.dumps(data))


def _get_mfa_challenge(ticket):
    if _use_redis():
        raw = _get_redis().get(f"mfa:{ticket}")
    else:
        raw = _mem_get(f"mfa:{ticket}")
    return json.loads(raw) if raw else None


def _delete_mfa_challenge(ticket):
    if _use_redis():
        r = _get_redis()
        r.delete(f"mfa:{ticket}")
        r.delete(f"mfa_attempts:{ticket}")
    else:
        _mem_del(f"mfa:{ticket}", f"mfa_attempts:{ticket}")


def _increment_mfa_attempt(ticket):
    if _use_redis():
        r = _get_redis()
        key = f"mfa_attempts:{ticket}"
        count = r.incr(key)
        r.expire(key, _MFA_TICKET_TTL_SECS)
        return count
    else:
        return _mem_incr(f"mfa_attempts:{ticket}", _MFA_TICKET_TTL_SECS)


def _store_2fa_setup(user_id, secret):
    if _use_redis():
        _get_redis().setex(f"2fa_setup:{user_id}", _PENDING_SETUP_TTL_SECS, secret)
    else:
        _mem_set(f"2fa_setup:{user_id}", _PENDING_SETUP_TTL_SECS, secret)


def _get_2fa_setup(user_id):
    if _use_redis():
        return _get_redis().get(f"2fa_setup:{user_id}")
    return _mem_get(f"2fa_setup:{user_id}")


def _delete_2fa_setup(user_id):
    if _use_redis():
        _get_redis().delete(f"2fa_setup:{user_id}")
    else:
        _mem_del(f"2fa_setup:{user_id}")


def _normalize_otp(value):
    return "".join(ch for ch in str(value or "") if ch.isdigit())


def _normalize_backup_code(value):
    return str(value or "").strip().upper().replace("-", "").replace(" ", "")


def _generate_backup_code():
    alphabet = string.ascii_uppercase + string.digits
    raw = "".join(secrets.choice(alphabet) for _ in range(8))
    return f"{raw[:4]}-{raw[4:]}"


def _replace_backup_codes(cur, user_id, count=8):
    cur.execute("DELETE FROM user_2fa_backup_codes WHERE user_id=%s", (user_id,))
    codes = []
    for _ in range(count):
        code = _generate_backup_code()
        cur.execute(
            "INSERT INTO user_2fa_backup_codes (user_id, code_hash) VALUES (%s,%s)",
            (user_id, hash_token(_normalize_backup_code(code))),
        )
        codes.append(code)
    return codes


def _verify_backup_code(cur, user_id, code):
    normalized = _normalize_backup_code(code)
    if not normalized:
        return False

    cur.execute(
        "SELECT id FROM user_2fa_backup_codes "
        "WHERE user_id=%s AND code_hash=%s AND used_at IS NULL LIMIT 1",
        (user_id, hash_token(normalized)),
    )
    row = cur.fetchone()
    if not row:
        return False

    cur.execute("UPDATE user_2fa_backup_codes SET used_at=NOW() WHERE id=%s", (row["id"],))
    return True


def _issue_tokens(cur, user_id, ip, user_agent, device_id, remember_me=False, family_id=None):
    access = create_access_token(user_id)
    refresh = generate_refresh_token()
    ttl = timedelta(days=7) if remember_me else timedelta(hours=24)

    cur.execute(
        """
        INSERT INTO refresh_tokens
        (id,user_id,token_hash,family_id,device_id,ip_address,user_agent,expires_at,revoked,remember_me)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,0,%s)
        """,
        (
            str(uuid.uuid4()),
            user_id,
            hash_token(refresh),
            family_id or str(uuid.uuid4()),
            device_id,
            ip,
            user_agent,
            datetime.utcnow() + ttl,
            1 if remember_me else 0,
        ),
    )

    return {
        "access_token": access,
        "refresh_token": refresh,
        "remember_me": remember_me,
    }


def get_user(email):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    result = cur.fetchone()
    db.close()
    return result


def get_user_by_id(user_id):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "SELECT id, email, username, avatar, verified, twofa_enabled FROM users WHERE id=%s",
        (user_id,),
    )
    result = cur.fetchone()
    db.close()
    return result


def get_current_user(token):
    try:
        payload = decode_access_token(token)
    except Exception:
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    user = get_user_by_id(user_id)
    if not user:
        return None

    return {
        "id": user["id"],
        "email": user["email"],
        "username": user.get("username"),
        "avatar": user.get("avatar"),
        "verified": user["verified"],
        "twofa_enabled": bool(user.get("twofa_enabled", 0)),
    }


def register_user(email, password):
    db = get_db()
    cur = db.cursor()

    email = email.lower().strip()

    cur.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        db.close()
        return None, "email_exists"

    user_id = str(uuid.uuid4())
    pw_hash = hash_password(password)

    raw_token = str(uuid.uuid4())
    token_hash = hash_token(raw_token)

    try:
        cur.execute(
            "INSERT INTO users (id,email,password_hash,verified) VALUES (%s,%s,%s,%s)",
            (user_id, email, pw_hash, 0),
        )
        cur.execute(
            "INSERT INTO email_verifications (user_id, token_hash, expires_at, created_at) VALUES (%s,%s,%s,NOW())",
            (user_id, token_hash, datetime.utcnow() + timedelta(hours=24)),
        )
        db.commit()
    except Exception:
        db.rollback()
        print("[register] DB error")
        return None, "db_error"
    finally:
        db.close()

    verify_link = f"{Config.FRONTEND_URL}/verify/{raw_token}"

    try:
        send_verify_mail(email, verify_link)
        print("[register] mail sent")
    except Exception as e:
        print(f"[register] mail error: {type(e).__name__}: {e}")

    return {"id": user_id}, None


def verify_email(token):
    db = get_db()
    cur = db.cursor()

    token_hash = hash_token(token.strip())

    cur.execute("SELECT * FROM email_verifications WHERE token_hash=%s", (token_hash,))
    row = cur.fetchone()

    if not row:
        db.close()
        return "not_found"

    if row["expires_at"] < datetime.utcnow():
        db.close()
        return "expired"

    cur.execute("UPDATE users SET verified=1 WHERE id=%s", (row["user_id"],))
    cur.execute("DELETE FROM email_verifications WHERE user_id=%s", (row["user_id"],))

    db.commit()
    db.close()
    return "ok"


def login_user(identifier, password, ip, user_agent, device_id, remember_me=False):
    db = get_db()
    cur = db.cursor()

    cur.execute(
        """
        SELECT *
        FROM users
        WHERE LOWER(email)=LOWER(%s)
           OR LOWER(username)=LOWER(%s)
        LIMIT 1
        """,
        (identifier, identifier),
    )

    user = cur.fetchone()

    check_hash = user["password_hash"] if user else _DUMMY_HASH
    password_ok = verify_password(password, check_hash)

    if not user or not password_ok:
        db.close()
        return None, "invalid_credentials"

    if int(user["verified"]) != 1:
        db.close()
        return None, "email_not_verified"

    if int(user.get("twofa_enabled", 0)) == 1 and user.get("twofa_secret"):
        ticket = str(uuid.uuid4())
        _store_mfa_challenge(ticket, {
            "user_id": user["id"],
            "remember_me": bool(remember_me),
            "device_id": device_id,
            "ip": ip,
            "user_agent": user_agent,
        })
        db.close()
        return {"mfa_required": True, "mfa_ticket": ticket}, None

    try:
        result = _issue_tokens(cur, user["id"], ip, user_agent, device_id, remember_me=bool(remember_me))
        db.commit()
        return result, None
    except Exception:
        db.rollback()
        return None, "db_error"
    finally:
        db.close()


def verify_login_2fa(mfa_ticket, code):
    ticket = str(mfa_ticket or "").strip()
    challenge = _get_mfa_challenge(ticket)

    if not challenge:
        return None, "invalid_mfa_ticket"

    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "SELECT id, twofa_enabled, twofa_secret FROM users WHERE id=%s LIMIT 1",
            (challenge["user_id"],),
        )
        user = cur.fetchone()

        if not user or int(user.get("twofa_enabled", 0)) != 1 or not user.get("twofa_secret"):
            _delete_mfa_challenge(ticket)
            return None, "invalid_mfa_ticket"

        otp = _normalize_otp(code)
        valid_totp = bool(otp) and pyotp.TOTP(user["twofa_secret"]).verify(otp, valid_window=1)
        valid_backup = _verify_backup_code(cur, user["id"], code)

        if not valid_totp and not valid_backup:
            attempts = _increment_mfa_attempt(ticket)
            if attempts >= _MAX_MFA_ATTEMPTS:
                _delete_mfa_challenge(ticket)
                return None, "too_many_attempts"
            return None, "invalid_code"

        result = _issue_tokens(
            cur,
            user["id"],
            challenge.get("ip"),
            challenge.get("user_agent"),
            challenge.get("device_id"),
            remember_me=bool(challenge.get("remember_me", False)),
        )

        db.commit()
        _delete_mfa_challenge(ticket)
        return result, None
    except Exception:
        db.rollback()
        return None, "db_error"
    finally:
        db.close()


def get_2fa_status(user_id):
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute("SELECT twofa_enabled FROM users WHERE id=%s", (user_id,))
        row = cur.fetchone()
        return bool(row and int(row.get("twofa_enabled", 0)) == 1)
    finally:
        db.close()


def start_2fa_setup(user_id):
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute("SELECT email, twofa_enabled FROM users WHERE id=%s", (user_id,))
        row = cur.fetchone()
        if not row:
            return None, "user_not_found"
        if int(row.get("twofa_enabled", 0)) == 1:
            return None, "already_enabled"

        secret = pyotp.random_base32()
        _store_2fa_setup(user_id, secret)

        otp_auth_url = pyotp.TOTP(secret).provisioning_uri(
            name=row["email"],
            issuer_name="Nexory",
        )
        return {
            "secret": secret,
            "otpauth_url": otp_auth_url,
        }, None
    finally:
        db.close()


def enable_2fa(user_id, code):
    secret = _get_2fa_setup(user_id)
    if not secret:
        return None, "setup_not_started"

    otp = _normalize_otp(code)
    if not otp or not pyotp.TOTP(secret).verify(otp, valid_window=1):
        return None, "invalid_code"

    db = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "UPDATE users SET twofa_enabled=1, twofa_secret=%s WHERE id=%s",
            (secret, user_id),
        )
        cur.execute("UPDATE refresh_tokens SET revoked=1 WHERE user_id=%s", (user_id,))
        backup_codes = _replace_backup_codes(cur, user_id)
        db.commit()
        _delete_2fa_setup(user_id)
        return {"enabled": True, "backup_codes": backup_codes}, None
    except Exception:
        db.rollback()
        return None, "db_error"
    finally:
        db.close()


def _validate_twofa_code(cur, user, code):
    otp = _normalize_otp(code)
    if otp and pyotp.TOTP(user["twofa_secret"]).verify(otp, valid_window=1):
        return True
    return _verify_backup_code(cur, user["id"], code)


def disable_2fa(user_id, code):
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "SELECT id, twofa_enabled, twofa_secret FROM users WHERE id=%s LIMIT 1",
            (user_id,),
        )
        user = cur.fetchone()

        if not user or int(user.get("twofa_enabled", 0)) != 1 or not user.get("twofa_secret"):
            return None, "not_enabled"

        if not _validate_twofa_code(cur, user, code):
            return None, "invalid_code"

        cur.execute("UPDATE users SET twofa_enabled=0, twofa_secret=NULL WHERE id=%s", (user_id,))
        cur.execute("DELETE FROM user_2fa_backup_codes WHERE user_id=%s", (user_id,))
        cur.execute("UPDATE refresh_tokens SET revoked=1 WHERE user_id=%s", (user_id,))
        db.commit()
        _delete_2fa_setup(user_id)
        return {"enabled": False}, None
    except Exception:
        db.rollback()
        return None, "db_error"
    finally:
        db.close()


def regenerate_2fa_backup_codes(user_id, code):
    db = get_db()
    cur = db.cursor()
    try:
        cur.execute(
            "SELECT id, twofa_enabled, twofa_secret FROM users WHERE id=%s LIMIT 1",
            (user_id,),
        )
        user = cur.fetchone()

        if not user or int(user.get("twofa_enabled", 0)) != 1 or not user.get("twofa_secret"):
            return None, "not_enabled"

        if not _validate_twofa_code(cur, user, code):
            return None, "invalid_code"

        backup_codes = _replace_backup_codes(cur, user_id)
        db.commit()
        return {"backup_codes": backup_codes}, None
    except Exception:
        db.rollback()
        return None, "db_error"
    finally:
        db.close()


def refresh_tokens(refresh_token):
    db = get_db()
    cur = db.cursor()

    token_hash = hash_token(refresh_token)

    cur.execute("SELECT * FROM refresh_tokens WHERE token_hash=%s AND revoked=0", (token_hash,))
    row = cur.fetchone()

    if not row:
        db.close()
        return None, "invalid_token"

    if row["expires_at"] < datetime.utcnow():
        db.close()
        return None, "expired"

    cur.execute("UPDATE refresh_tokens SET revoked=1 WHERE token_hash=%s", (token_hash,))

    new_refresh = generate_refresh_token()
    remember_me = bool(row.get("remember_me", 1))
    ttl = timedelta(days=7) if remember_me else timedelta(hours=24)

    cur.execute(
        """
        INSERT INTO refresh_tokens
        (id,user_id,token_hash,family_id,device_id,ip_address,user_agent,expires_at,revoked,remember_me)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,0,%s)
        """,
        (
            str(uuid.uuid4()),
            row["user_id"],
            hash_token(new_refresh),
            row["family_id"],
            row["device_id"],
            row["ip_address"],
            row["user_agent"],
            datetime.utcnow() + ttl,
            1 if remember_me else 0,
        ),
    )

    db.commit()
    db.close()

    return {
        "access_token": create_access_token(row["user_id"]),
        "refresh_token": new_refresh,
        "remember_me": remember_me,
    }, None


def logout_user(refresh_token):
    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE refresh_tokens SET revoked=1 WHERE token_hash=%s", (hash_token(refresh_token),))
    db.commit()
    db.close()


def request_password_reset(email):
    user = get_user(email)
    if not user:
        return

    db = get_db()
    cur = db.cursor()

    raw_token = str(uuid.uuid4())
    token_hash = hash_token(raw_token)

    try:
        cur.execute(
            "INSERT INTO password_resets (user_id, token, expires_at) VALUES (%s,%s,%s)",
            (user["id"], token_hash, datetime.utcnow() + timedelta(hours=1)),
        )
        db.commit()
    except Exception:
        db.rollback()
        print("[password_reset] DB error")
        return
    finally:
        db.close()

    link = f"{Config.FRONTEND_URL}/reset/{raw_token}"
    try:
        send_reset_mail(email, link)
        print("[password_reset] mail sent")
    except Exception as e:
        print(f"[password_reset] mail error: {type(e).__name__}: {e}")


def reset_password(token, new_password):
    db = get_db()
    cur = db.cursor()

    token_hash = hash_token(token.strip())
    cur.execute("SELECT user_id, expires_at FROM password_resets WHERE token=%s", (token_hash,))
    row = cur.fetchone()

    if not row:
        db.close()
        return {"status": "invalid"}

    if row["expires_at"] < datetime.utcnow():
        db.close()
        return {"status": "expired"}

    cur.execute(
        "UPDATE users SET password_hash=%s WHERE id=%s",
        (hash_password(new_password), row["user_id"]),
    )
    cur.execute("UPDATE refresh_tokens SET revoked=1 WHERE user_id=%s", (row["user_id"],))
    cur.execute("DELETE FROM password_resets WHERE user_id=%s", (row["user_id"],))

    db.commit()
    db.close()
    return {"status": "success"}

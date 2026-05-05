import uuid
from datetime import datetime, timedelta

from app.db.connection import get_db
from app.auth.tokens import create_access_token, decode_access_token
from app.security.hashing import hash_token, generate_refresh_token
from app.security.password import hash_password, verify_password
from app.config import Config
from app.mailer import send_verify_mail, send_reset_mail


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
    cur.execute("SELECT id, email, verified FROM users WHERE id=%s", (user_id,))
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
        "verified": user["verified"]
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
            (user_id, email, pw_hash, 0)
        )
        cur.execute(
            "INSERT INTO email_verifications (user_id, token_hash, expires_at, created_at) VALUES (%s,%s,%s,NOW())",
            (user_id, token_hash, datetime.utcnow() + timedelta(hours=24))
        )
        db.commit()
    except Exception as e:
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


# Dummy hash used to prevent timing-based email enumeration
_DUMMY_HASH = "$2b$12$invalidhashfortimingXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"


def login_user(email, password, ip, user_agent, device_id, remember_me=False):
    user = get_user(email)

    check_hash = user["password_hash"] if user else _DUMMY_HASH
    password_ok = verify_password(password, check_hash)

    if not user or not password_ok:
        return None, "invalid_credentials"

    if int(user["verified"]) != 1:
        return None, "email_not_verified"

    access = create_access_token(user["id"])
    refresh = generate_refresh_token()

    ttl = timedelta(days=7) if remember_me else timedelta(hours=24)

    db = get_db()
    cur = db.cursor()

    cur.execute(
        """
        INSERT INTO refresh_tokens
        (id,user_id,token_hash,family_id,device_id,ip_address,user_agent,expires_at,revoked,remember_me)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,0,%s)
        """,
        (
            str(uuid.uuid4()),
            user["id"],
            hash_token(refresh),
            str(uuid.uuid4()),
            device_id,
            ip,
            user_agent,
            datetime.utcnow() + ttl,
            1 if remember_me else 0
        )
    )

    db.commit()
    db.close()

    return {
        "access_token": access,
        "refresh_token": refresh,
        "remember_me": remember_me
    }, None


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
            1 if remember_me else 0
        )
    )

    db.commit()
    db.close()

    return {
        "access_token": create_access_token(row["user_id"]),
        "refresh_token": new_refresh
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
            (user["id"], token_hash, datetime.utcnow() + timedelta(hours=1))
        )
        db.commit()
    except Exception as e:
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
        (hash_password(new_password), row["user_id"])
    )
    cur.execute("UPDATE refresh_tokens SET revoked=1 WHERE user_id=%s", (row["user_id"],))
    cur.execute("DELETE FROM password_resets WHERE user_id=%s", (row["user_id"],))

    db.commit()
    db.close()
    return {"status": "success"}

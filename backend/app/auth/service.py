import uuid
from datetime import datetime, timedelta

from app.db.connection import get_db
from app.auth.tokens import create_access_token, decode_access_token
from app.security.hashing import hash_token, generate_refresh_token
from app.security.password import hash_password, verify_password
from app.config import Config
from app.mailer import send_mail


def get_user(email):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    return cur.fetchone()


def get_user_by_id(user_id):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT id, email, verified FROM users WHERE id=%s", (user_id,))
    return cur.fetchone()


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


def commit(db):
    db.commit()


def register_user(email, password):
    db = get_db()
    cur = db.cursor()

    email = email.lower().strip()

    cur.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        return None, "email_exists"

    user_id = str(uuid.uuid4())
    pw_hash = hash_password(password)

    cur.execute(
        "INSERT INTO users (id,email,password_hash,verified) VALUES (%s,%s,%s,%s)",
        (user_id, email, pw_hash, 0)
    )

    raw_token = str(uuid.uuid4())
    token_hash = hash_token(raw_token)

    cur.execute(
        "INSERT INTO email_verifications (user_id, token_hash, expires_at, created_at) VALUES (%s,%s,%s,NOW())",
        (user_id, token_hash, datetime.utcnow() + timedelta(hours=24))
    )

    commit(db)

    verify_link = f"{Config.FRONTEND_URL}/api/auth/verify/{raw_token}"

    send_mail(email, "Verify your account", verify_link)

    return {"id": user_id}, None


def verify_email(token):
    db = get_db()
    cur = db.cursor()

    token_hash = hash_token(token.strip())

    cur.execute("SELECT * FROM email_verifications WHERE token_hash=%s", (token_hash,))
    row = cur.fetchone()

    if not row:
        return False

    if row["expires_at"] < datetime.utcnow():
        return False

    cur.execute("UPDATE users SET verified=1 WHERE id=%s", (row["user_id"],))
    cur.execute("DELETE FROM email_verifications WHERE user_id=%s", (row["user_id"],))

    commit(db)
    return True


def login_user(email, password, ip, user_agent, device_id):
    user = get_user(email)

    if not user or not verify_password(password, user["password_hash"]):
        return None, "invalid_credentials"

    if int(user["verified"]) != 1:
        return None, "email_not_verified"

    access = create_access_token(user["id"])
    refresh = generate_refresh_token()

    db = get_db()
    cur = db.cursor()

    cur.execute(
        """
        INSERT INTO refresh_tokens
        (id,user_id,token_hash,family_id,device_id,ip_address,user_agent,expires_at,revoked)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,0)
        """,
        (
            str(uuid.uuid4()),
            user["id"],
            hash_token(refresh),
            str(uuid.uuid4()),
            device_id,
            ip,
            user_agent,
            datetime.utcnow() + timedelta(days=7)
        )
    )

    commit(db)

    return {
        "access_token": access,
        "refresh_token": refresh
    }, None


def refresh_tokens(refresh_token):
    db = get_db()
    cur = db.cursor()

    token_hash = hash_token(refresh_token)

    cur.execute("SELECT * FROM refresh_tokens WHERE token_hash=%s AND revoked=0", (token_hash,))
    row = cur.fetchone()

    if not row:
        return None, "invalid_token"

    if row["expires_at"] < datetime.utcnow():
        return None, "expired"

    cur.execute("UPDATE refresh_tokens SET revoked=1 WHERE token_hash=%s", (token_hash,))

    new_refresh = generate_refresh_token()

    cur.execute(
        """
        INSERT INTO refresh_tokens
        (id,user_id,token_hash,family_id,device_id,ip_address,user_agent,expires_at,revoked)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,0)
        """,
        (
            str(uuid.uuid4()),
            row["user_id"],
            hash_token(new_refresh),
            row["family_id"],
            row["device_id"],
            row["ip_address"],
            row["user_agent"],
            datetime.utcnow() + timedelta(days=7)
        )
    )

    commit(db)

    return {
        "access_token": create_access_token(row["user_id"]),
        "refresh_token": new_refresh
    }, None


def logout_user(refresh_token):
    db = get_db()
    cur = db.cursor()
    cur.execute("UPDATE refresh_tokens SET revoked=1 WHERE token_hash=%s", (hash_token(refresh_token),))
    commit(db)


def request_password_reset(email):
    user = get_user(email)
    if not user:
        return

    db = get_db()
    cur = db.cursor()

    token = str(uuid.uuid4())

    cur.execute(
        "INSERT INTO password_resets (user_id, token, expires_at) VALUES (%s,%s,%s)",
        (user["id"], token, datetime.utcnow() + timedelta(hours=1))
    )

    commit(db)

    link = f"{Config.FRONTEND_URL}/reset/{token}"
    send_mail(email, "Reset password", link)


def reset_password(token, new_password):
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT user_id, expires_at FROM password_resets WHERE token=%s", (token.strip(),))
    row = cur.fetchone()

    if not row:
        return {"status": "invalid"}

    if row["expires_at"] < datetime.utcnow():
        return {"status": "expired"}

    cur.execute(
        "UPDATE users SET password_hash=%s WHERE id=%s",
        (hash_password(new_password), row["user_id"])
    )

    cur.execute("DELETE FROM password_resets WHERE user_id=%s", (row["user_id"],))

    commit(db)
    return {"status": "success"}

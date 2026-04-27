import uuid
from datetime import datetime, timedelta

from app.db.connection import get_db
from app.auth.tokens import create_access_token
from app.security.hashing import hash_token, generate_refresh_token
from app.security.password import hash_password, verify_password
from app.config import Config
from app.mailer import send_mail


def get_user(email):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    return cur.fetchone()


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

    send_mail(
        email,
        "Verify your account",
        f"Hello,\n\nplease verify your account by clicking this link:\n{verify_link}\n\nIf you did not create this account, you can ignore this email."
    )

    return {"id": user_id}, None


def verify_email(token):
    db = get_db()
    cur = db.cursor()

    token = token.strip()
    token_hash = hash_token(token)

    cur.execute(
        "SELECT * FROM email_verifications WHERE token_hash=%s",
        (token_hash,)
    )

    row = cur.fetchone()

    if not row:
        return False

    if row["expires_at"] < datetime.utcnow():
        cur.execute(
            "DELETE FROM email_verifications WHERE token_hash=%s",
            (token_hash,)
        )
        commit(db)
        return False

    cur.execute(
        "UPDATE users SET verified=1 WHERE id=%s",
        (row["user_id"],)
    )

    cur.execute(
        "DELETE FROM email_verifications WHERE user_id=%s",
        (row["user_id"],)
    )

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

    cur.execute(
        "SELECT * FROM refresh_tokens WHERE token_hash=%s AND revoked=0",
        (token_hash,)
    )

    row = cur.fetchone()

    if not row:
        return None, "invalid_token"

    if row["expires_at"] < datetime.utcnow():
        return None, "expired"

    cur.execute(
        "UPDATE refresh_tokens SET revoked=1 WHERE token_hash=%s",
        (token_hash,)
    )

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

    cur.execute(
        "UPDATE refresh_tokens SET revoked=1 WHERE token_hash=%s",
        (hash_token(refresh_token),)
    )

    commit(db)


def request_password_reset(email):
    user = get_user(email)
    if not user:
        return

    db = get_db()
    cur = db.cursor()

    raw_token = str(uuid.uuid4())
    token_hash = hash_token(raw_token)

    cur.execute(
        "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (%s,%s,%s)",
        (user["id"], token_hash, datetime.utcnow() + timedelta(hours=1))
    )

    commit(db)

    reset_link = f"{Config.FRONTEND_URL}/reset/{raw_token}"

    send_mail(
        email,
        "Reset password",
        f"Hello,\n\nreset your password using this link:\n{reset_link}\n\nIf this wasn't you, ignore this email."
    )


def reset_password(token, new_password):
    db = get_db()
    cur = db.cursor()

    token_hash = hash_token(token.strip())

    cur.execute(
        "SELECT user_id, expires_at FROM password_resets WHERE token_hash=%s",
        (token_hash,)
    )

    row = cur.fetchone()

    if not row:
        return False

    if row["expires_at"] < datetime.utcnow():
        return False

    cur.execute(
        "UPDATE users SET password_hash=%s WHERE id=%s",
        (hash_password(new_password), row["user_id"])
    )

    cur.execute(
        "DELETE FROM password_resets WHERE user_id=%s",
        (row["user_id"],)
    )

    commit(db)
    return True

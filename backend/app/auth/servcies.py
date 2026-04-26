import uuid
from datetime import datetime, timedelta

from app.db.connection import get_db
from app.auth.tokens import create_access_token
from app.security.hashing import hash_token, generate_refresh_token
from app.security.password import hash_password, verify_password
from app.config import Config


def get_user(email):
    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    return cur.fetchone()


def store_refresh_token(user_id, token, device_id, ip, user_agent, family_id):
    db = get_db()
    cur = db.cursor()

    expires_at = datetime.utcnow() + timedelta(days=Config.REFRESH_TOKEN_DAYS)

    cur.execute("""
        INSERT INTO refresh_tokens
        (id, user_id, token_hash, family_id, device_id, ip_address, user_agent, expires_at, revoked)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,0)
    """, (
        str(uuid.uuid4()),
        user_id,
        hash_token(token),
        family_id,
        device_id,
        ip,
        user_agent,
        expires_at
    ))


def login_user(email, password, ip, user_agent, device_id):
    user = get_user(email)

    if not user or not verify_password(password, user["password_hash"]):
        return None, "invalid_credentials"

    access = create_access_token(user["id"])
    refresh = generate_refresh_token()
    family_id = str(uuid.uuid4())

    store_refresh_token(
        user["id"],
        refresh,
        device_id,
        ip,
        user_agent,
        family_id
    )

    return {
        "access_token": access,
        "refresh_token": refresh
    }, None


def refresh_tokens(refresh_token):
    db = get_db()
    cur = db.cursor()

    token_hash = hash_token(refresh_token)

    cur.execute("""
        SELECT * FROM refresh_tokens
        WHERE token_hash=%s AND revoked=0
    """, (token_hash,))

    row = cur.fetchone()

    if not row:
        return None, "invalid_token"

    if row["expires_at"] < datetime.utcnow():
        return None, "expired"

    cur.execute("""
        UPDATE refresh_tokens
        SET revoked=1
        WHERE token_hash=%s
    """, (token_hash,))

    new_refresh = generate_refresh_token()

    store_refresh_token(
        row["user_id"],
        new_refresh,
        row["device_id"],
        row["ip_address"],
        row["user_agent"],
        row["family_id"]
    )

    return {
        "access_token": create_access_token(row["user_id"]),
        "refresh_token": new_refresh
    }, None


def logout_user(refresh_token):
    db = get_db()
    cur = db.cursor()

    cur.execute("""
        UPDATE refresh_tokens
        SET revoked=1
        WHERE token_hash=%s
    """, (hash_token(refresh_token),))


def register_user(email, password):
    db = get_db()
    cur = db.cursor()

    email = email.lower().strip()

    cur.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        return None, "email_exists"

    pw_hash = hash_password(password)
    user_id = str(uuid.uuid4())

    cur.execute("""
        INSERT INTO users (id, email, password_hash)
        VALUES (%s, %s, %s)
    """, (
        user_id,
        email,
        pw_hash
    ))

    return {"id": user_id}, None

import json
import os
import time
from pathlib import Path
from datetime import datetime, timedelta

import requests
import jwt
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import pymysql

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "change-me")

bcrypt = Bcrypt(app)
csrf = CSRFProtect(app)
limiter = Limiter(get_remote_address, app=app, storage_uri="memory://")

CORS(
    app,
    resources={r"/api/*": {"origins": [
        "https://nexory-dev.de",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]}},
    supports_credentials=True,
)

JWT_SECRET = os.getenv("JWT_SECRET", "jwt-secret-change")
ACCESS_EXPIRE_MIN = 15
REFRESH_EXPIRE_DAYS = 7

SUPPORTED_LANGUAGES = {"de", "en"}
DEFAULT_LANGUAGE = "de"

MESSAGES = {
    "missing_fields": {"de": "Fehlende Felder", "en": "Missing fields"},
    "email_exists": {"de": "E-Mail existiert bereits", "en": "Email already exists"},
    "invalid_credentials": {"de": "Ungültige Zugangsdaten", "en": "Invalid credentials"},
    "not_verified": {"de": "E-Mail nicht verifiziert", "en": "Email not verified"},
    "locked": {"de": "Account gesperrt", "en": "Account locked"},
    "invalid_token": {"de": "Ungültiger Token", "en": "Invalid token"},
    "invalid": {"de": "Ungültig", "en": "Invalid"},
    "ok": {"de": "OK", "en": "OK"},
    "error": {"de": "Fehler", "en": "Error"},
    "registered": {"de": "Registriert", "en": "Registered"},
    "verified": {"de": "Verifiziert", "en": "Verified"},
    "logged_in": {"de": "Angemeldet", "en": "Logged in"},
    "logged_out": {"de": "Abgemeldet", "en": "Logged out"},
    "updated": {"de": "Aktualisiert", "en": "Updated"},
}

def get_lang():
    return request.headers.get("X-Language", DEFAULT_LANGUAGE)

def msg(key):
    lang = get_lang()
    return MESSAGES.get(key, {}).get(lang, key)

def get_db():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=3306,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

def create_access_token(user_id):
    return jwt.encode(
        {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_EXPIRE_MIN)
        },
        JWT_SECRET,
        algorithm="HS256"
    )

def create_refresh_token(user_id):
    return jwt.encode(
        {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(days=REFRESH_EXPIRE_DAYS)
        },
        JWT_SECRET,
        algorithm="HS256"
    )

def decode_token(token):
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

def store_refresh_token(user_id, token):
    db = get_db()
    cur = db.cursor()
    cur.execute(
        "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
        (
            user_id,
            token,
            datetime.utcnow() + timedelta(days=REFRESH_EXPIRE_DAYS)
        )
    )

def delete_refresh_token(token):
    db = get_db()
    cur = db.cursor()
    cur.execute("DELETE FROM refresh_tokens WHERE token_hash=%s", (token,))

@app.route("/api/csrf")
def get_csrf():
    return jsonify({"csrf_token": generate_csrf(), "status": msg("ok")})

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": msg("missing_fields")}), 400

    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT id FROM users WHERE email=%s", (email,))
    if cur.fetchone():
        return jsonify({"error": msg("email_exists")}), 409

    pw = bcrypt.generate_password_hash(password).decode()

    cur.execute(
        "INSERT INTO users (email, password_hash, email_verified) VALUES (%s, %s, 0)",
        (email, pw),
    )

    return jsonify({"status": msg("registered")})

@app.route("/api/auth/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password")

    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cur.fetchone()

    if not user:
        return jsonify({"error": msg("invalid_credentials")}), 401

    if not bcrypt.check_password_hash(user["password_hash"], password):
        return jsonify({"error": msg("invalid_credentials")}), 401

    access = create_access_token(user["id"])
    refresh = create_refresh_token(user["id"])

    store_refresh_token(user["id"], refresh)

    return jsonify({
        "access_token": access,
        "refresh_token": refresh,
        "status": msg("logged_in")
    })

@app.route("/api/auth/refresh", methods=["POST"])
def refresh():
    data = request.get_json() or {}
    token = data.get("refresh_token")

    try:
        payload = decode_token(token)
        user_id = payload["user_id"]
    except:
        return jsonify({"error": msg("invalid_token")}), 401

    db = get_db()
    cur = db.cursor()
    cur.execute("SELECT * FROM refresh_tokens WHERE token_hash=%s", (token,))
    if not cur.fetchone():
        return jsonify({"error": msg("invalid_token")}), 401

    new_access = create_access_token(user_id)

    return jsonify({"access_token": new_access})

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    data = request.get_json() or {}
    token = data.get("refresh_token")

    if token:
        delete_refresh_token(token)

    return jsonify({"status": msg("logged_out")})

@app.route("/api/language", methods=["GET", "POST"])
def language():
    if request.method == "GET":
        return jsonify({"language": get_lang()})

    data = request.get_json() or {}
    lang = data.get("language")

    if lang not in SUPPORTED_LANGUAGES:
        return jsonify({"error": msg("invalid")}), 400

    return jsonify({"language": lang})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

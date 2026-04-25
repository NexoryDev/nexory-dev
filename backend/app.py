import json
import os
import time
from pathlib import Path
from datetime import datetime

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from itsdangerous import URLSafeTimedSerializer
import pymysql

from flask_dance.contrib.github import github, make_github_blueprint

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "change-me")

bcrypt = Bcrypt(app)
csrf = CSRFProtect(app)

limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri="memory://"
)

serializer = URLSafeTimedSerializer(app.secret_key)

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False
)

CORS(
    app,
    resources={r"/api/*": {"origins": [
        "https://nexory-dev.de",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]}},
    supports_credentials=True,
)

GITHUB_ORG = "NexoryDev"
GITHUB_API = "https://api.github.com"

SUPPORTED_LANGUAGES = {"de", "en"}
DEFAULT_LANGUAGE = "de"

github_bp = make_github_blueprint(
    client_id=os.getenv("GITHUB_CLIENT_ID"),
    client_secret=os.getenv("GITHUB_CLIENT_SECRET"),
)
app.register_blueprint(github_bp, url_prefix="/login")


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

def get_token():
    return os.getenv("GITHUB_TOKEN", "").strip()


@app.after_request
def secure_headers(response):
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response


@app.route("/api/csrf", methods=["GET"])
def get_csrf():
    return jsonify({"csrf_token": generate_csrf()})


@app.route("/api/test-db")
def test_db():
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT DATABASE() as db")
        return jsonify({"status": "ok", "db": cur.fetchone()})
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500


@app.route("/api/test-users")
def test_users():
    try:
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT id, email, email_verified FROM users LIMIT 10")
        return jsonify(cur.fetchall())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/debug-db")
def debug_db():
    import os
    return {
        "host": os.getenv("DB_HOST"),
        "user": os.getenv("DB_USER"),
        "db": os.getenv("DB_NAME")
    }

@app.route("/api/auth/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "missing fields"}), 400

    password_hash = bcrypt.generate_password_hash(password).decode()

    db = get_db()
    cur = db.cursor()

    try:
        cur.execute(
            "INSERT INTO users (email, password_hash, email_verified) VALUES (%s, %s, 0)",
            (email, password_hash),
        )
    except Exception:
        return jsonify({"error": "email already exists"}), 409

    token = serializer.dumps(email, salt="verify")
    return jsonify({"status": "registered", "verify": token})


@app.route("/api/auth/verify/<token>")
def verify(token):
    try:
        email = serializer.loads(token, salt="verify", max_age=3600)
    except:
        return jsonify({"error": "invalid token"}), 400

    db = get_db()
    cur = db.cursor()
    cur.execute(
        "UPDATE users SET email_verified=1 WHERE email=%s",
        (email,)
    )

    return jsonify({"status": "verified"})


@app.route("/api/auth/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cur.fetchone()

    if not user:
        return jsonify({"error": "invalid credentials"}), 401

    if not user.get("email_verified"):
        return jsonify({"error": "not verified"}), 403

    locked_until = user.get("locked_until")
    if locked_until:
        try:
            if str(locked_until) > str(datetime.utcnow()):
                return jsonify({"error": "locked"}), 403
        except:
            pass

    if not bcrypt.check_password_hash(user["password_hash"], password):
        return jsonify({"error": "invalid credentials"}), 401

    session.clear()
    session["user_id"] = user["id"]

    return jsonify({"status": "logged in"})

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.clear()

    response = jsonify({"status": "logged out"})
    response.delete_cookie("session")

    return response

@app.route("/api/auth/forgot", methods=["POST"])
def forgot():
    email = request.json.get("email")
    token = serializer.dumps(email, salt="reset")
    return jsonify({"status": "ok", "token": token})


@app.route("/api/auth/reset/<token>", methods=["POST"])
def reset(token):
    try:
        email = serializer.loads(token, salt="reset", max_age=1800)
    except:
        return jsonify({"error": "invalid token"}), 400

    password = request.json.get("password")
    hash_pw = bcrypt.generate_password_hash(password).decode()

    db = get_db()
    cur = db.cursor()
    cur.execute(
        "UPDATE users SET password_hash=%s WHERE email=%s",
        (hash_pw, email)
    )

    return jsonify({"status": "updated"})


@app.route("/api/github")
def github_api():
    token = get_token()
    if not token:
        return jsonify({"error": "no token"}), 500

    return jsonify({"status": "github endpoint ready"})


@app.route("/api/language", methods=["GET", "POST"])
def language():
    if request.method == "GET":
        return jsonify({"language": session.get("language", DEFAULT_LANGUAGE)})

    data = request.get_json() or {}
    lang = data.get("language")

    if lang not in SUPPORTED_LANGUAGES:
        return jsonify({"error": "invalid"}), 400

    session["language"] = lang
    return jsonify({"language": lang})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

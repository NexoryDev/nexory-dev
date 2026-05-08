import hashlib
import hmac
import json
import os
import secrets
import urllib.parse

import requests
from flask import Blueprint, redirect, request, jsonify

from app.config import Config
from app.auth.tokens import decode_access_token
from app.db.connection import get_db

github_oauth_bp = Blueprint("github_oauth", __name__)

_GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
_GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
_GITHUB_USER_URL = "https://api.github.com/user"
_SCOPE = "read:user"
_STATE_TTL = 10 * 60


def _sign_state(raw: str) -> str:
    """HMAC-sign the raw state so it cannot be forged."""
    return hmac.new(
        Config.SECRET_KEY.encode(),
        raw.encode(),
        hashlib.sha256,
    ).hexdigest()


def _make_state(user_id: str) -> str:
    nonce = secrets.token_urlsafe(24)
    payload = json.dumps({"uid": user_id, "nonce": nonce})
    b64 = urllib.parse.quote(payload)
    sig = _sign_state(payload)
    return f"{b64}.{sig}"


def _verify_state(state: str) -> str | None:
    try:
        b64, sig = state.rsplit(".", 1)
        payload = urllib.parse.unquote(b64)
        expected = _sign_state(payload)
        if not hmac.compare_digest(sig, expected):
            return None
        data = json.loads(payload)
        return data.get("uid")
    except Exception:
        return None


def _extract_user_id_from_header() -> str | None:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        return decode_access_token(auth.split(" ", 1)[1]).get("sub")
    except Exception:
        return None


@github_oauth_bp.route("/github/connect/start", methods=["GET", "OPTIONS"])
def connect_start():
    if request.method == "OPTIONS":
        return "", 204

    user_id = _extract_user_id_from_header()
    if not user_id:
        return jsonify({"error": "invalid_token"}), 401

    if not Config.GITHUB_CLIENT_ID:
        return jsonify({"error": "github_oauth_not_configured"}), 503

    state = _make_state(user_id)

    params = urllib.parse.urlencode({
        "client_id": Config.GITHUB_CLIENT_ID,
        "redirect_uri": f"{Config.FRONTEND_URL}/github/callback",
        "scope": _SCOPE,
        "state": state,
        "allow_signup": "false",
    })

    return jsonify({"url": f"{_GITHUB_AUTHORIZE_URL}?{params}"})


@github_oauth_bp.route("/github/connect/callback", methods=["POST", "OPTIONS"])
def connect_callback():
    if request.method == "OPTIONS":
        return "", 204

    if not request.is_json:
        return jsonify({"error": "invalid_content_type"}), 415

    data = request.get_json(silent=True) or {}
    code = (data.get("code") or "").strip()
    state = (data.get("state") or "").strip()

    if not code or not state:
        return jsonify({"error": "missing_params"}), 400

    user_id = _verify_state(state)
    if not user_id:
        return jsonify({"error": "invalid_state"}), 400

    try:
        token_res = requests.post(
            _GITHUB_TOKEN_URL,
            json={
                "client_id": Config.GITHUB_CLIENT_ID,
                "client_secret": Config.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": f"{Config.FRONTEND_URL}/github/callback",
            },
            headers={"Accept": "application/json"},
            timeout=15,
        )
        token_res.raise_for_status()
        token_data = token_res.json()
    except Exception:
        return jsonify({"error": "github_token_exchange_failed"}), 502

    github_access_token = token_data.get("access_token")
    if not github_access_token:
        return jsonify({"error": "github_no_token"}), 502

    try:
        user_res = requests.get(
            _GITHUB_USER_URL,
            headers={
                "Authorization": f"Bearer {github_access_token}",
                "Accept": "application/vnd.github+json",
                "User-Agent": "nexory-backend",
            },
            timeout=10,
        )
        user_res.raise_for_status()
        gh_user = user_res.json()
    except Exception:
        return jsonify({"error": "github_profile_fetch_failed"}), 502

    gh_id = str(gh_user.get("id", ""))
    gh_login = gh_user.get("login", "")

    if not gh_id or not gh_login:
        return jsonify({"error": "github_invalid_profile"}), 502

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "SELECT id FROM users WHERE github_id = %s AND id != %s",
            (gh_id, user_id),
        )
        if cursor.fetchone():
            return jsonify({"error": "github_already_linked"}), 409

        cursor.execute(
            "UPDATE users SET github_id = %s, github_username = %s WHERE id = %s",
            (gh_id, gh_login, user_id),
        )
        db.commit()
    except Exception:
        db.rollback()
        return jsonify({"error": "db_error"}), 500
    finally:
        db.close()

    return jsonify({
        "github_username": gh_login,
        "github_id": gh_id,
    })

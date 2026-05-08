from flask import Blueprint, request, jsonify, make_response
from app.auth.service import (
    login_user,
    verify_login_2fa,
    refresh_tokens,
    logout_user,
    register_user,
    verify_email,
    request_password_reset,
    reset_password,
    get_current_user,
    get_2fa_status,
    start_2fa_setup,
    enable_2fa,
    disable_2fa,
    regenerate_2fa_backup_codes,
)
from app.config import Config

auth_bp = Blueprint("auth", __name__)


def set_refresh_cookie(response, token, remember_me=False):
    max_age = 7 * 24 * 60 * 60 if remember_me else None
    response.set_cookie(
        "refresh_token",
        token,
        httponly=True,
        secure=Config.COOKIE_SECURE,
        samesite=Config.COOKIE_SAMESITE,
        path="/",
        max_age=max_age,
    )


def clear_refresh_cookie(response):
    response.set_cookie(
        "refresh_token",
        "",
        httponly=True,
        secure=Config.COOKIE_SECURE,
        samesite=Config.COOKIE_SAMESITE,
        expires=0,
        path="/"
    )


def extract_bearer_token():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip()


@auth_bp.route("/me", methods=["GET"])
def me():
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "missing_token"}), 401

    token = auth_header.split(" ")[1]
    user = get_current_user(token)

    if not user:
        return jsonify({"error": "invalid_token"}), 401

    return jsonify(user)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    email = data.get("email", "").lower().strip()
    password = data.get("password")

    if not email or not password or len(password) < 8 or len(password) > 128:
        return jsonify({"error": "missing_fields"}), 400

    result, error = register_user(email, password)

    if error and error != "email_exists":
        return jsonify({"error": error}), 400

    return jsonify({"status": "registered"})


@auth_bp.route("/verify/<token>", methods=["GET"])
def verify(token):
    result = verify_email(token)

    if result != "ok":
        return jsonify({"error": result}), 400

    return jsonify({"status": "verified"})


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    remember_me = bool(data.get("remember_me", False))

    result, error = login_user(
        data.get("identifier") or data.get("email"),
        data.get("password"),
        request.remote_addr,
        request.headers.get("User-Agent"),
        data.get("device_id"),
        remember_me
    )

    if error:
        return jsonify({"error": error}), 401

    if result.get("mfa_required"):
        return jsonify({
            "mfa_required": True,
            "mfa_ticket": result["mfa_ticket"],
        })

    res = make_response(jsonify({
        "access_token": result["access_token"],
        "remember_me": result["remember_me"]
    }))

    set_refresh_cookie(res, result["refresh_token"], remember_me=remember_me)
    return res


@auth_bp.route("/2fa/verify", methods=["POST"])
def verify_2fa():
    data = request.get_json() or {}

    result, error = verify_login_2fa(
        data.get("mfa_ticket"),
        data.get("code"),
    )

    if error:
        return jsonify({"error": error}), 401

    res = make_response(jsonify({
        "access_token": result["access_token"],
        "remember_me": result["remember_me"],
    }))

    set_refresh_cookie(res, result["refresh_token"], remember_me=result.get("remember_me", False))
    return res


@auth_bp.route("/2fa/status", methods=["GET"])
def twofa_status():
    token = extract_bearer_token()
    if not token:
        return jsonify({"error": "missing_token"}), 401

    user = get_current_user(token)
    if not user:
        return jsonify({"error": "invalid_token"}), 401

    return jsonify({"enabled": get_2fa_status(user["id"])})


@auth_bp.route("/2fa/setup", methods=["POST"])
def twofa_setup():
    token = extract_bearer_token()
    if not token:
        return jsonify({"error": "missing_token"}), 401

    user = get_current_user(token)
    if not user:
        return jsonify({"error": "invalid_token"}), 401

    result, error = start_2fa_setup(user["id"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(result)


@auth_bp.route("/2fa/enable", methods=["POST"])
def twofa_enable():
    token = extract_bearer_token()
    if not token:
        return jsonify({"error": "missing_token"}), 401

    user = get_current_user(token)
    if not user:
        return jsonify({"error": "invalid_token"}), 401

    data = request.get_json() or {}
    result, error = enable_2fa(user["id"], data.get("code"))
    if error:
        return jsonify({"error": error}), 400

    return jsonify(result)


@auth_bp.route("/2fa/disable", methods=["POST"])
def twofa_disable():
    token = extract_bearer_token()
    if not token:
        return jsonify({"error": "missing_token"}), 401

    user = get_current_user(token)
    if not user:
        return jsonify({"error": "invalid_token"}), 401

    data = request.get_json() or {}
    result, error = disable_2fa(user["id"], data.get("code"))
    if error:
        return jsonify({"error": error}), 400

    return jsonify(result)


@auth_bp.route("/2fa/backup/regenerate", methods=["POST"])
def twofa_regenerate_backup_codes():
    token = extract_bearer_token()
    if not token:
        return jsonify({"error": "missing_token"}), 401

    user = get_current_user(token)
    if not user:
        return jsonify({"error": "invalid_token"}), 401

    data = request.get_json() or {}
    result, error = regenerate_2fa_backup_codes(user["id"], data.get("code"))
    if error:
        return jsonify({"error": error}), 400

    return jsonify(result)


@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    token = request.cookies.get("refresh_token")

    if not token:
        return jsonify({"error": "missing_token"}), 401

    result, error = refresh_tokens(token)

    if error:
        return jsonify({"error": error}), 401

    res = make_response(jsonify({
        "access_token": result["access_token"]
    }))

    set_refresh_cookie(res, result["refresh_token"], remember_me=result.get("remember_me", False))
    return res


@auth_bp.route("/logout", methods=["POST"])
def logout():
    token = request.cookies.get("refresh_token")

    if token:
        logout_user(token)

    res = make_response(jsonify({"status": "logged_out"}))
    clear_refresh_cookie(res)
    return res


@auth_bp.route("/password/request", methods=["POST"])
def password_request():
    data = request.get_json() or {}
    email = data.get("email", "").lower().strip()

    if not email:
        return jsonify({"error": "missing_email"}), 400

    request_password_reset(email)
    return jsonify({"status": "ok"})


@auth_bp.route("/password/reset/<token>", methods=["POST"])
def password_reset(token):
    data = request.get_json() or {}
    password = data.get("password")

    if not password or len(password) < 8 or len(password) > 128:
        return jsonify({"error": "weak_password"}), 400

    result = reset_password(token, password)

    if result.get("status") != "success":
        return jsonify({"error": result.get("status")}), 400

    return jsonify({"status": "password_updated"})

from flask import Blueprint, request, jsonify, current_app

from app.auth.tokens import decode_access_token
from app.profile.service import (
    get_user_by_id,
    serialize_user,
    update_user,
    upload_avatar,
    get_user_and_refresh_token,
    delete_user_account,
    change_password
)

profile_bp = Blueprint("profile", __name__)


def extract_user_id():
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]

    try:
        payload = decode_access_token(token)
        return payload.get("sub")
    except Exception:
        return None


@profile_bp.route("/me", methods=["GET", "OPTIONS"])
def me():
    if request.method == "OPTIONS":
        return "", 204

    user_id = extract_user_id()

    if not user_id:
        return jsonify({"error": "invalid_token"}), 401

    user, new_token = get_user_and_refresh_token(user_id)

    if not user:
        return jsonify({"error": "user_not_found"}), 404

    return jsonify({
        "user": serialize_user(user),
        "access_token": new_token
    })


@profile_bp.route("/me/update", methods=["POST", "OPTIONS"])
def update():
    if request.method == "OPTIONS":
        return "", 204

    user_id = extract_user_id()

    if not user_id:
        return jsonify({"error": "invalid_token"}), 401

    if not request.is_json:
        return jsonify({"error": "invalid_content_type"}), 415

    data = request.get_json()

    success, err = update_user(user_id, data)

    if not success:
        status = 409 if err == "username_taken" else 400
        return jsonify({"error": err or "no_fields_to_update"}), status

    return jsonify({"status": "updated"})


@profile_bp.route("/me/avatar", methods=["POST", "OPTIONS"])
def upload_avatar_route():
    if request.method == "OPTIONS":
        return "", 204

    user_id = extract_user_id()
    if not user_id:
        return jsonify({"error": "invalid_token"}), 401

    if not request.content_type or not request.content_type.startswith("multipart/form-data"):
        return jsonify({"error": "invalid_content_type"}), 415

    max_bytes = int(current_app.config.get("AVATAR_MAX_UPLOAD_BYTES", current_app.config.get("MAX_CONTENT_LENGTH", 5 * 1024 * 1024)))
    if request.content_length and request.content_length > max_bytes:
        return jsonify({"error": "file_too_large"}), 413

    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "no_file"}), 400

    url, err = upload_avatar(user_id, file)
    if not url:
        return jsonify({"error": err or "upload_failed"}), 400

    return jsonify({"avatar": url})


@profile_bp.route("/me/delete", methods=["POST", "OPTIONS"])
def delete_me():
    if request.method == "OPTIONS":
        return "", 204

    user_id = extract_user_id()

    if not user_id:
        return jsonify({"error": "invalid_token"}), 401

    deleted = delete_user_account(user_id)

    if not deleted:
        return jsonify({"error": "delete_failed"}), 400

    return jsonify({"status": "deleted"})


@profile_bp.route("/me/password", methods=["POST", "OPTIONS"])
def update_password():
    if request.method == "OPTIONS":
        return "", 204

    user_id = extract_user_id()

    if not user_id:
        return jsonify({"error": "invalid_token"}), 401

    if not request.is_json:
        return jsonify({"error": "invalid_content_type"}), 415

    data = request.get_json()
    password = data.get("password", "")

    if not password or len(password) < 8 or len(password) > 128:
        return jsonify({"error": "weak_password"}), 400

    success = change_password(user_id, password)

    if not success:
        return jsonify({"error": "update_failed"}), 400

    return jsonify({"status": "updated"})


@profile_bp.route("/me/github", methods=["DELETE", "OPTIONS"])
def disconnect_github():
    if request.method == "OPTIONS":
        return "", 204

    user_id = extract_user_id()
    if not user_id:
        return jsonify({"error": "invalid_token"}), 401

    from app.db.connection import get_db
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "UPDATE users SET github_id = NULL, github_username = NULL WHERE id = %s",
            (user_id,),
        )
        db.commit()
    except Exception:
        db.rollback()
        return jsonify({"error": "db_error"}), 500
    finally:
        db.close()

    return jsonify({"status": "disconnected"})


@profile_bp.route("/me/badges/sync", methods=["POST", "OPTIONS"])
def sync_badges_route():
    if request.method == "OPTIONS":
        return "", 204

    user_id = extract_user_id()
    if not user_id:
        return jsonify({"error": "invalid_token"}), 401

    from app.profile.badges import sync_badges
    badges, newly_earned = sync_badges(user_id)

    if badges is None:
        return jsonify({"error": "sync_failed"}), 500

    return jsonify({"badges": badges, "newly_earned": list(newly_earned)})


@profile_bp.route("/public/<username>", methods=["GET"])
def public_profile(username):
    from app.profile.badges import get_public_profile
    data = get_public_profile(username)
    if not data:
        return jsonify({"error": "not_found"}), 404
    return jsonify(data)

from flask import Blueprint, request, jsonify

from app.auth.tokens import decode_access_token
from app.profile.service import (
    get_user_by_id,
    serialize_user,
    update_user,
    get_user_and_refresh_token,
    delete_user_account
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

    success = update_user(user_id, data)

    if not success:
        return jsonify({"error": "no_fields_to_update"}), 400

    return jsonify({"status": "updated"})


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

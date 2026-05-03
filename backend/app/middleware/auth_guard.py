from functools import wraps
from flask import request, jsonify
from app.auth.tokens import decode_access_token


def auth_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization")

        if not header:
            return jsonify({"error": "missing_token"}), 401

        try:
            token = header.split(" ")[1]
            payload = decode_access_token(token)

        except Exception:
            return jsonify({"error": "invalid_token"}), 401

        return fn(user_id=payload["sub"], *args, **kwargs)

    return wrapper

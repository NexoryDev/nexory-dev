import jwt
import uuid
from datetime import datetime, timedelta
from app.config import Config


def create_access_token(user_id):
    now = datetime.utcnow()

    return jwt.encode({
        "sub": str(user_id),
        "type": "access",
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": now + timedelta(minutes=Config.ACCESS_TOKEN_MINUTES)
    }, Config.JWT_SECRET_KEY, algorithm="HS256")


def decode_access_token(token):
    payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])

    if payload.get("type") != "access":
        raise jwt.InvalidTokenError("invalid_token_type")

    return payload

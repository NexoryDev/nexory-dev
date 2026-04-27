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
    }, Config.JWT_SECRET, algorithm="HS256")


def decode_token(token):
    return jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET = os.getenv("JWT_SECRET")

    ENV = os.getenv("ENV", "development")

    COOKIE_SECURE = ENV == "production"
    COOKIE_SAMESITE = "Strict" if ENV == "production" else "Lax"

    ACCESS_TOKEN_MINUTES = 15
    REFRESH_TOKEN_DAYS = 7

    DB_HOST = os.getenv("DB_HOST")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")

    if not SECRET_KEY or not JWT_SECRET:
        raise RuntimeError("Missing critical env secrets")

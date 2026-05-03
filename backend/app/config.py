import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET")
    JWT_TOKEN_LOCATION = ["headers"]

    ENV = os.getenv("ENV", "development")

    COOKIE_SECURE = ENV == "production"
    COOKIE_SAMESITE = "Strict" if ENV == "production" else "Lax"

    ACCESS_TOKEN_MINUTES = 15
    REFRESH_TOKEN_DAYS = 7

    DB_HOST = os.getenv("DB_HOST")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")

    MAIL_HOST = os.getenv("MAIL_HOST")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USER = os.getenv("MAIL_USER")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_FROM = os.getenv("MAIL_FROM")
    MAIL_TLS = os.getenv("MAIL_TLS", "true").lower() == "true"

    FRONTEND_URL = os.getenv("FRONTEND_URL")

    if not SECRET_KEY or not JWT_SECRET_KEY:
        raise RuntimeError("Missing critical env secrets")

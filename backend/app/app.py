from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import threading
import time
import os
import logging

from app.config import Config, UPLOAD_FOLDER
from app.logging_config import configure_logging
from app.auth.routes import auth_bp
from app.github.routes import github_bp
from app.github.oauth import github_oauth_bp
from app.profile.routes import profile_bp

limiter = Limiter(key_func=get_remote_address, default_limits=[])
logger = logging.getLogger(__name__)


def _cleanup_worker():
    while True:
        time.sleep(3600)
        try:
            from app.db.connection import get_db
            db = get_db()
            cur = db.cursor()
            cur.execute("DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked=1")
            cur.execute("DELETE FROM email_verifications WHERE expires_at < NOW()")
            cur.execute("DELETE FROM password_resets WHERE expires_at < NOW()")
            db.commit()
            db.close()
        except Exception as exc:
            logger.warning("Cleanup worker failed: %s", exc)


def create_app():
    configure_logging()

    app = Flask(__name__)
    app.config.from_object(Config)

    limiter.init_app(app)

    allowed_origins = ["http://localhost:3000"]
    if Config.FRONTEND_URL and Config.FRONTEND_URL not in allowed_origins:
        allowed_origins.append(Config.FRONTEND_URL)

    CORS(
        app,
        resources={r"/api/*": {
            "origins": allowed_origins
        }},
        supports_credentials=True,
        allow_headers=[
            "Content-Type",
            "Authorization",
            "X-Language",
            "X-CSRFToken"
        ],
        methods=["GET", "POST", "DELETE", "OPTIONS"]
    )

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(github_bp, url_prefix="/api")
    app.register_blueprint(github_oauth_bp, url_prefix="/api")

    limiter.limit("10 per minute")(app.view_functions["auth.login"])
    limiter.limit("5 per minute")(app.view_functions["auth.register"])
    limiter.limit("5 per minute")(app.view_functions["auth.password_request"])
    limiter.limit("10 per minute")(app.view_functions["auth.verify_2fa"])
    limiter.limit("5 per minute")(app.view_functions["auth.twofa_setup"])
    limiter.limit("5 per minute")(app.view_functions["auth.twofa_enable"])
    limiter.limit("5 per minute")(app.view_functions["auth.twofa_disable"])
    limiter.limit("3 per minute")(app.view_functions["auth.twofa_regenerate_backup_codes"])
    limiter.limit("30 per minute")(app.view_functions["github.github"])
    limiter.limit("6 per minute")(app.view_functions["profile.upload_avatar_route"])

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    @app.route("/uploads/avatars/<path:filename>")
    def serve_avatar(filename):
        from flask import send_from_directory
        if "/" in filename or "\\" in filename or filename.startswith("."):
            return "", 404
        return send_from_directory(UPLOAD_FOLDER, filename)


    t = threading.Thread(target=_cleanup_worker, daemon=True)
    t.start()

    @app.after_request
    def set_security_headers(response):
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.github.com; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        return response

    return app

app = create_app()

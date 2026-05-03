from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import threading
import time

from app.config import Config
from app.auth.routes import auth_bp
from app.github.routes import github_bp
from app.profile.routes import profile_bp

limiter = Limiter(key_func=get_remote_address, default_limits=[])


def _cleanup_worker():
    """Background thread: removes expired tokens from DB every hour."""
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
        except Exception:
            pass


def create_app():
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
        methods=["GET", "POST", "OPTIONS"]
    )

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(profile_bp, url_prefix="/api/profile")
    app.register_blueprint(github_bp, url_prefix="/api")

    # Rate limits on sensitive auth endpoints
    limiter.limit("10 per minute")(app.view_functions["auth.login"])
    limiter.limit("5 per minute")(app.view_functions["auth.register"])
    limiter.limit("5 per minute")(app.view_functions["auth.password_request"])
    limiter.limit("30 per minute")(app.view_functions["github.github"])

    # Start background cleanup thread (daemon so it stops with the process)
    t = threading.Thread(target=_cleanup_worker, daemon=True)
    t.start()

    return app

app = create_app()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.config import Config
from app.auth.routes import auth_bp
from app.github.routes import github_bp
from app.profile.routes import profile_bp

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    jwt.init_app(app)

    CORS(
        app,
        resources={r"/api/*": {
            "origins": [
                "http://localhost:3000"
            ]
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

    return app

app = create_app()

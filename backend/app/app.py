from flask import Flask, request
from flask_cors import CORS

from app.config import Config
from app.auth.routes import auth_bp
from app.github.routes import github_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

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

    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            return "", 200

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(github_bp, url_prefix="/api")

    return app


app = create_app()

import os
from app.app import app


def _env_bool(value: str | None) -> bool:
    if not value:
        return False
    return value.strip().lower() in {"1", "true", "yes", "on"}


if __name__ == "__main__":
    env = os.getenv("ENV", "development").strip().lower()

    if env == "production":
        debug = False
    else:
        debug = _env_bool(os.getenv("FLASK_DEBUG")) or env == "development"

    app.run(host="0.0.0.0", port=5000, debug=debug)

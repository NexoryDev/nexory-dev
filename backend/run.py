import os
from app.app import app

if __name__ == "__main__":
    debug = os.getenv("ENV", "development") == "development"
    app.run(host="0.0.0.0", port=5000, debug=debug)

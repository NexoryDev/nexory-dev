import json
import time
from pathlib import Path

CACHE_TTL = 120
CACHE_FILE = Path(__file__).resolve().parent / "cache" / "github-dashboard.json"


def cache_read(allow_old=False):
    if not CACHE_FILE.exists():
        return None

    try:
        raw = json.loads(CACHE_FILE.read_text("utf-8"))
        age = time.time() - raw.get("generated_at", 0)

        if allow_old or age < CACHE_TTL:
            return raw.get("data")

    except Exception:
        return None

    return None


def cache_write(data):
    try:
        CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)

        CACHE_FILE.write_text(
            json.dumps({"generated_at": time.time(), "data": data}, ensure_ascii=False),
            "utf-8"
        )
    except Exception:
        pass

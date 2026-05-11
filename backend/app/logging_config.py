import logging
import os
import re
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path


_SENSITIVE_KV_PATTERNS = [
    re.compile(r"(?i)(authorization\s*[:=]\s*)([^\s,;]+)"),
    re.compile(r"(?i)(bearer\s+)([^\s,;]+)"),
    re.compile(r"(?i)(token\s*[:=]\s*)([^\s,;]+)"),
    re.compile(r"(?i)(secret\s*[:=]\s*)([^\s,;]+)"),
    re.compile(r"(?i)(password\s*[:=]\s*)([^\s,;]+)"),
    re.compile(r"(?i)(api[_-]?key\s*[:=]\s*)([^\s,;]+)"),
]

_JWT_PATTERN = re.compile(r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b")
_EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
_IPV4_PATTERN = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b"
)
_IPV6_PATTERN = re.compile(r"\b(?:[0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}\b")

_ENV_POLICY = {
    "development": {"retention_days": 7, "default_level": "DEBUG"},
    "staging": {"retention_days": 30, "default_level": "INFO"},
    "production": {"retention_days": 90, "default_level": "WARNING"},
}


def _mask_text(value: str) -> str:
    masked = value
    for pattern in _SENSITIVE_KV_PATTERNS:
        masked = pattern.sub(r"\1[REDACTED]", masked)
    masked = _JWT_PATTERN.sub("[REDACTED_JWT]", masked)
    masked = _EMAIL_PATTERN.sub("[REDACTED_EMAIL]", masked)
    masked = _IPV4_PATTERN.sub("[REDACTED_IP]", masked)
    masked = _IPV6_PATTERN.sub("[REDACTED_IP]", masked)
    return masked


def _sanitize(value):
    if isinstance(value, str):
        return _mask_text(value)
    if isinstance(value, dict):
        return {k: _sanitize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_sanitize(v) for v in value]
    if isinstance(value, tuple):
        return tuple(_sanitize(v) for v in value)
    return value


class RedactingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.msg = _sanitize(record.msg)
        record.args = _sanitize(record.args)
        return True


def _build_log_dir() -> Path:
    configured = os.getenv("LOG_DIR")
    if configured:
        return Path(configured).expanduser().resolve()

    backend_dir = Path(__file__).resolve().parents[1]
    return backend_dir / "logs"


def _get_env_name() -> str:
    env = os.getenv("ENV", "development").strip().lower()
    if env in _ENV_POLICY:
        return env
    return "development"


def _resolve_log_level(env_name: str) -> int:
    configured_level = os.getenv("LOG_LEVEL")
    if configured_level:
        return getattr(logging, configured_level.upper(), logging.INFO)

    default_level = _ENV_POLICY[env_name]["default_level"]
    return getattr(logging, default_level, logging.INFO)


def _resolve_retention_days(env_name: str) -> int:
    configured_days = os.getenv("LOG_RETENTION_DAYS")
    if configured_days:
        try:
            days = int(configured_days)
            return max(days, 1)
        except ValueError:
            pass

    return int(_ENV_POLICY[env_name]["retention_days"])


def configure_logging() -> None:
    root_logger = logging.getLogger()
    if getattr(root_logger, "_nexory_secure_logging", False):
        return

    env_name = _get_env_name()
    log_level = _resolve_log_level(env_name)
    retention_days = _resolve_retention_days(env_name)

    # Separate log folders by environment to enforce different retention policies.
    log_dir = _build_log_dir() / env_name
    log_dir.mkdir(parents=True, exist_ok=True)

    formatter = logging.Formatter(
        "%(asctime)s %(levelname)s [%(name)s] %(message)s",
        "%Y-%m-%dT%H:%M:%S%z",
    )
    redaction_filter = RedactingFilter()

    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(formatter)
    console_handler.addFilter(redaction_filter)

    file_handler = TimedRotatingFileHandler(
        log_dir / "app.log",
        when="midnight",
        interval=1,
        backupCount=retention_days,
        encoding="utf-8",
        utc=True,
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(formatter)
    file_handler.addFilter(redaction_filter)

    root_logger.setLevel(log_level)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger._nexory_secure_logging = True

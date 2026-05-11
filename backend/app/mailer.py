import json
import requests
from urllib.parse import urlparse
from app.config import Config


def send_verify_mail(to, verify_link):
    _send_template(to, Config.MAIL_TEMPLATE_VERIFY, {"LINK": verify_link})


def send_reset_mail(to, reset_link):
    _send_template(to, Config.MAIL_TEMPLATE_RESET, {"LINK": reset_link})


def _send_template(to, template_id, variables):
    payload = json.dumps({
        "from": Config.MAIL_FROM,
        "to": [to],
        "template": {
            "id": template_id,
            "variables": variables,
        },
    }).encode("utf-8")

    resend_url = "https://api.resend.com/emails"
    parsed = urlparse(resend_url)
    if parsed.scheme != "https" or parsed.netloc != "api.resend.com":
        raise RuntimeError("Invalid mail provider URL")

    res = requests.post(
        resend_url,
        data=payload,
        headers={
            "Authorization": f"Bearer {Config.MAIL_PASSWORD}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        },
        timeout=15,
    )
    if res.status_code not in (200, 201):
        raise RuntimeError(f"Resend API error: {res.status_code}")

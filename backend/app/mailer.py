import urllib.request
import json
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

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {Config.MAIL_PASSWORD}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=15) as res:
        if res.status not in (200, 201):
            raise RuntimeError(f"Resend API error: {res.status}")

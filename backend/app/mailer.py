import urllib.request
import urllib.error
import json
from app.config import Config


def send_mail(to, subject, content):
    payload = json.dumps({
        "from": Config.MAIL_FROM,
        "to": [to],
        "subject": subject,
        "text": content,
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

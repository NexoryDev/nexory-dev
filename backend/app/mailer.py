import urllib.request
import urllib.error
import json
from email.utils import parseaddr
from app.config import Config


def send_mail(to, subject, content):
    _, from_addr = parseaddr(Config.MAIL_FROM)

    payload = json.dumps({
        "from": Config.MAIL_FROM.strip('"'),
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
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=10) as res:
        if res.status not in (200, 201):
            raise RuntimeError(f"Resend API error: {res.status}")

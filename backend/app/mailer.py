import smtplib
import ssl
from email.mime.text import MIMEText
from email.utils import parseaddr
from app.config import Config


def send_mail(to, subject, content):
    msg = MIMEText(content, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = Config.MAIL_FROM
    msg["To"] = to

    _, envelope_from = parseaddr(Config.MAIL_FROM)

    context = ssl.create_default_context()

    if Config.MAIL_PORT == 465:
        # SSL direkt (kein STARTTLS) – für smtp.resend.com:465
        with smtplib.SMTP_SSL(Config.MAIL_HOST, Config.MAIL_PORT, context=context, timeout=15) as server:
            server.login(Config.MAIL_USER, Config.MAIL_PASSWORD)
            server.sendmail(envelope_from, to, msg.as_string())
    else:
        # STARTTLS – für Port 587
        with smtplib.SMTP(Config.MAIL_HOST, Config.MAIL_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(Config.MAIL_USER, Config.MAIL_PASSWORD)
            server.sendmail(envelope_from, to, msg.as_string())

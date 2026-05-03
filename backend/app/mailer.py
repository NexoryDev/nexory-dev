import smtplib
import ssl
from email.mime.text import MIMEText
from app.config import Config


def send_mail(to, subject, content):
    msg = MIMEText(content, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = Config.MAIL_FROM
    msg["To"] = to

    server = smtplib.SMTP(Config.MAIL_HOST, Config.MAIL_PORT)
    server.ehlo()

    if Config.MAIL_TLS:
        server.starttls(context=ssl.create_default_context())
        server.ehlo()

    server.login(Config.MAIL_USER, Config.MAIL_PASSWORD)
    server.sendmail(Config.MAIL_FROM, to, msg.as_string())
    server.quit()

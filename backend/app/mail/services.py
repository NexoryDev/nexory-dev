import smtplib
import os
from email.mime.text import MIMEText
from app.config import Config


def send_mail(to, subject, html):
    msg = MIMEText(html, "html")
    msg["Subject"] = subject
    msg["From"] = Config.MAIL_FROM
    msg["To"] = to

    server = smtplib.SMTP(Config.MAIL_HOST, Config.MAIL_PORT)
    if Config.MAIL_TLS:
        server.starttls()

    server.login(Config.MAIL_USER, Config.MAIL_PASSWORD)
    server.sendmail(Config.MAIL_FROM, [to], msg.as_string())
    server.quit()

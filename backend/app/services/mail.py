import smtplib
from email.message import EmailMessage
from app.config import Config

def send_email(to_email, subject, html):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = Config.MAIL_FROM
    msg["To"] = to_email

    msg.set_content("Email client does not support HTML")
    msg.add_alternative(html, subtype="html")

    if Config.MAIL_TLS:
        server = smtplib.SMTP(Config.MAIL_HOST, Config.MAIL_PORT)
        server.starttls()
    else:
        server = smtplib.SMTP_SSL(Config.MAIL_HOST, Config.MAIL_PORT)

    server.login(Config.MAIL_USER, Config.MAIL_PASSWORD)
    server.send_message(msg)
    server.quit()

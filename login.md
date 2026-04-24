# Login System (GitHub + Email, sicher und DSGVO-konform)

Dieses Dokument erklärt Schritt für Schritt, wie du ein sauberes Login-System für deine Anwendung aufbaust.
Es kombiniert:

* Login mit GitHub
* Login mit Email und Passwort
* Einen gemeinsamen Account pro Nutzer
* Sicherheitsmechanismen gegen typische Angriffe
* DSGVO-konforme Umsetzung

Das Ziel ist ein System, das in der Praxis funktioniert, verständlich bleibt und sich später problemlos erweitern lässt.

---

# Ziel

Ein Nutzer soll:

* sich mit Email registrieren können
* seine Email bestätigen
* sich mit Email oder GitHub einloggen können
* sein Passwort zurücksetzen können
* GitHub später mit seinem bestehenden Account verbinden können

Wichtig ist:
Egal welchen Weg er nutzt, es bleibt immer derselbe Account.

---

# 1. Datenbank

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash TEXT,
    github_id VARCHAR(255) UNIQUE,
    username VARCHAR(255),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    failed_logins INT DEFAULT 0,
    locked_until DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Gedanke dahinter:

* Email und Passwort sind für den klassischen Login
* github_id ist für den GitHub Login
* Ein Nutzer kann beides haben
* failed_logins und locked_until schützen vor Angriffen

---

# 2. Backend Setup

```bash
pip install flask-bcrypt flask-dance flask-wtf flask-limiter itsdangerous
```

Diese Pakete decken alles ab:

* Passwort-Hashing
* GitHub OAuth
* CSRF-Schutz
* Rate Limiting
* Token für Verifizierung und Passwort-Reset

---

## Grundkonfiguration

```python
from flask_bcrypt import Bcrypt
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from itsdangerous import URLSafeTimedSerializer
from datetime import datetime, timedelta

bcrypt = Bcrypt(app)
csrf = CSRFProtect(app)

limiter = Limiter(get_remote_address, app=app)

serializer = URLSafeTimedSerializer(app.secret_key)
```

---

# Cookies und Sessions

```python
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=True
)
```

Was hier passiert:

* HTTPOnly verhindert Zugriff durch JavaScript
* SameSite schützt vor fremden Requests
* Secure sorgt dafür, dass Cookies nur über HTTPS übertragen werden

Diese Cookies sind technisch notwendig, weil sie den Login ermöglichen.
Du brauchst dafür kein Opt-in, aber du musst sie im Cookie-Hinweis erwähnen.

---

# Security Headers

```python
@app.after_request
def secure_headers(response):
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; img-src 'self' https:;"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response
```

Das sind zusätzliche Schutzmaßnahmen im Hintergrund, die typische Browser-Angriffe erschweren.

---

# 3. Registrierung

```python
@app.route("/api/auth/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    data = request.json

    email = data["email"]
    password = data["password"]

    if len(password) < 10:
        return {"error": "Password too weak"}, 400

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "INSERT INTO users (email, password_hash) VALUES (%s, %s)",
        (email, password_hash)
    )
    db.commit()

    token = serializer.dumps(email, salt="verify")
    print(f"Verify: http://localhost:5000/api/auth/verify/{token}")

    return {"status": "registered"}
```

Nach der Registrierung bekommt der Nutzer einen Verifizierungslink.
In der Praxis würdest du diesen per Email verschicken.

---

# 4. Email verifizieren

```python
@app.route("/api/auth/verify/<token>")
def verify(token):
    try:
        email = serializer.loads(token, salt="verify", max_age=3600)
    except:
        return {"error": "Invalid token"}, 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE users SET email_verified=TRUE WHERE email=%s",
        (email,)
    )
    db.commit()

    return {"status": "verified"}
```

Der Token ist zeitlich begrenzt und stellt sicher, dass die Email wirklich dem Nutzer gehört.

---

# 5. Login mit Email

```python
@app.route("/api/auth/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    data = request.json
    email = data["email"]
    password = data["password"]

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        return {"error": "Invalid credentials"}, 401

    if not user["email_verified"]:
        return {"error": "Email not verified"}, 403

    if user["locked_until"] and user["locked_until"] > datetime.utcnow():
        return {"error": "Account temporarily locked"}, 403

    if not bcrypt.check_password_hash(user["password_hash"], password):
        failed = user["failed_logins"] + 1
        lock = None

        if failed >= 5:
            lock = datetime.utcnow() + timedelta(minutes=15)
            failed = 0

        cursor.execute(
            "UPDATE users SET failed_logins=%s, locked_until=%s WHERE id=%s",
            (failed, lock, user["id"])
        )
        db.commit()

        return {"error": "Invalid credentials"}, 401

    cursor.execute(
        "UPDATE users SET failed_logins=0, locked_until=NULL WHERE id=%s",
        (user["id"],)
    )
    db.commit()

    session.clear()
    session["user_id"] = user["id"]

    return {"status": "logged in"}
```

Hier steckt viel Schutz drin:

* Rate Limit gegen Brute Force
* Account wird bei zu vielen Fehlversuchen gesperrt
* Session wird nach Login neu gesetzt

---

# 6. Passwort vergessen

```python
@app.route("/api/auth/forgot", methods=["POST"])
def forgot():
    email = request.json["email"]

    token = serializer.dumps(email, salt="reset")
    print(f"Reset: http://localhost:3000/reset/{token}")

    return {"status": "ok"}
```

---

```python
@app.route("/api/auth/reset/<token>", methods=["POST"])
def reset(token):
    try:
        email = serializer.loads(token, salt="reset", max_age=1800)
    except:
        return {"error": "Invalid token"}, 400

    password = request.json["password"]

    hash_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE users SET password_hash=%s WHERE email=%s",
        (hash_pw, email)
    )
    db.commit()

    return {"status": "updated"}
```

Der Reset-Link ist zeitlich begrenzt und kann nur einmal sinnvoll genutzt werden.

---

# 7. GitHub Login

```python
@app.route("/api/auth/github")
def github_login():
    if not github.authorized:
        return redirect(url_for("github.login"))

    resp = github.get("/user")
    data = resp.json()

    db = get_db()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE github_id=%s", (data["id"],))
    user = cursor.fetchone()

    if not user:
        cursor.execute(
            "INSERT INTO users (github_id, username, avatar_url) VALUES (%s, %s, %s)",
            (data["id"], data["login"], data["avatar_url"])
        )
        db.commit()
        user_id = cursor.lastrowid
    else:
        user_id = user["id"]

    session.clear()
    session["user_id"] = user_id

    return redirect("/")
```

Hier wird bewusst kein automatisches Verknüpfen über Email gemacht, da diese bei GitHub oft fehlt oder privat ist.

---

# 8. GitHub mit Account verbinden

```python
@app.route("/api/auth/github/connect")
def connect():
    if "user_id" not in session:
        return {"error": "Not logged in"}, 401

    if not github.authorized:
        return redirect(url_for("github.login"))

    resp = github.get("/user")
    data = resp.json()

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "UPDATE users SET github_id=%s WHERE id=%s",
        (data["id"], session["user_id"])
    )
    db.commit()

    return {"status": "connected"}
```

Das ist der saubere Weg, um Accounts zu verbinden.

---

# DSGVO Hinweise

## Cookies

Du verwendest nur einen Session-Cookie.

Dieser:

* enthält keine persönlichen Daten
* dient nur dazu, den Nutzer wiederzuerkennen

Er ist technisch notwendig und benötigt kein Opt-in, muss aber erwähnt werden.

---

## Datenschutzerklärung

Du solltest aufnehmen:

* Login über GitHub
* Speicherung von Email, Username und Avatar
* Zweck: Bereitstellung eines Nutzerkontos

---

## Nutzerrechte

Der Nutzer sollte:

* seinen Account löschen können
* wissen, welche Daten gespeichert werden

---

# Ergebnis

Du hast jetzt ein Login-System, das:

* mehrere Login-Methoden unterstützt
* sicher gegen typische Angriffe ist
* datenschutzrechtlich sauber aufgebaut ist
* sich gut erweitern lässt

---

# Nächste sinnvolle Schritte

* Email wirklich versenden (SMTP)
* einfache Profilseite
* optional Rollen (Admin / User)
* optional 2FA

---

Ende der Datei

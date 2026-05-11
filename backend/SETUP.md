# Backend Setup

## Requirements

* Python 3.11+
* pip
* (optional) Docker

---

## Local Setup

### 1. Clone repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

---

### 2. Create virtual environment (recommended)

```bash
python -m venv .venv
source .venv/bin/activate
```

Windows:

```bash
.venv\Scripts\activate
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Set up the database

```bash
mysql -u root -p < schema.sql
```

This creates the `nexory` database and all required tables.

---

### 5. Create environment file

```bash
cp .env.example .env
```

Edit `.env`:

```env
SECRET_KEY=your-secret-key-min-32-chars
JWT_SECRET=your-jwt-secret-min-32-chars

ENV=development

LOG_LEVEL=INFO
LOG_RETENTION_DAYS=7
LOG_DIR=/app/logs

AVATAR_ENABLE_MALWARE_SCAN=false
AVATAR_CLAMD_HOST=clamav
AVATAR_CLAMD_PORT=3310
AVATAR_SCAN_TIMEOUT_SECONDS=20
AVATAR_QUARANTINE_FOLDER=/app/static/uploads/avatar-quarantine
AVATAR_MAX_UPLOAD_BYTES=5242880
AVATAR_MAX_DIMENSION=4096
AVATAR_MAX_PIXELS=12000000
AVATAR_OUTPUT_SIZE=400

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=nexory

MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=noreply@example.com
MAIL_PASSWORD=your-mail-password
MAIL_FROM=noreply@example.com
MAIL_TLS=true

FRONTEND_URL=http://localhost:3000

GITHUB_TOKEN=your-github-personal-access-token

# GitHub OAuth App (für Account-Verbindung)
# Erstelle eine OAuth App unter https://github.com/settings/developers
# Callback URL: https://yourdomain.com/github/callback
GITHUB_CLIENT_ID=your-github-oauth-app-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-app-client-secret
```

---

### 6. Run development server

```bash
python run.py
```

Server runs at:

```
http://localhost:5000
```

---

## Production Setup

### Run with Gunicorn

```bash
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

---

## Docker Setup (recommended)

### Build image

```bash
docker build -t flask-backend .
```

---

### Run container

```bash
docker run -p 5000:5000 --env-file .env flask-backend
```

### Run with Docker Compose

From the repository root:

```bash
docker compose up --build
```

This starts Redis, the backend, the frontend, and ClamAV. Avatar uploads are written to a quarantine folder first and are only published after a clean scan.

---

## API Endpoints

| Method | Endpoint                       | Description              |
| ------ | ------------------------------ | ------------------------ |
| POST   | /api/auth/register             | Register (sends email)   |
| GET    | /api/auth/verify/:token        | Verify email             |
| POST   | /api/auth/login                | Login                    |
| POST   | /api/auth/refresh              | Refresh tokens           |
| POST   | /api/auth/logout               | Logout                   |
| POST   | /api/auth/password/request     | Request password reset   |
| POST   | /api/auth/password/reset/:token| Reset password           |
| GET    | /api/auth/me                   | Get current user         |

---

## Security Notes

* Access tokens expire after 15 minutes
* Refresh tokens are rotated on every use
* Refresh tokens should be stored in httpOnly cookies (recommended)
* Passwords are hashed using bcrypt
* Rate limiting should be enabled in production (Redis recommended)
* Do not use default secrets in production
* Flask debug mode should stay disabled in production (`ENV=production`)
* Avatar uploads are scanned via ClamAV and fail closed if the scanner is unavailable
* Logs are rotated and redacted; avoid logging secrets, tokens, or PII

---

## Troubleshooting

| Problem              | Solution                             |
| -------------------- | ------------------------------------ |
| Cannot connect to DB | Check DB_HOST, DB_USER, DB_PASSWORD  |
| 401 Unauthorized     | Token expired or invalid             |
| CORS errors          | Verify frontend origin configuration |
| Module not found     | Run pip install -r requirements.txt  |

---

## Recommended Next Steps

* Use Redis for rate limiting and session tracking
* Add HTTPS (via reverse proxy like Nginx)
* Implement email verification
* Add 2FA (TOTP)
* Set up logging and monitoring
* Keep ClamAV and system packages updated regularly

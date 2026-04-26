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

### 4. Create environment file

```bash
cp .env.example .env
```

Edit `.env`:

```env
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=your-db
```

---

### 5. Run development server

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

---

## API Endpoints

| Method | Endpoint           | Description    |
| ------ | ------------------ | -------------- |
| POST   | /api/auth/login    | Login user     |
| POST   | /api/auth/refresh  | Refresh tokens |
| POST   | /api/auth/register | Register user  |

---

## Security Notes

* Access tokens expire after 15 minutes
* Refresh tokens are rotated on every use
* Refresh tokens should be stored in httpOnly cookies (recommended)
* Passwords are hashed using bcrypt
* Rate limiting should be enabled in production (Redis recommended)
* Do not use default secrets in production

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

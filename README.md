# nexory-dev

Website repository for [nexory-dev.de](https://nexory-dev.de).

The project consists of a React single-page app and a small Python/Flask API that proxies GitHub data and manages the language preference.

## What's included

- React SPA with pages for Home, GitHub, Contact, and legal texts
- Internationalisation (German / English) in the frontend
- Flask API that proxies the GitHub REST API (with a short server-side cache)
- Language preference stored in a server-side session

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Create React App), React Router 6 |
| Backend | Python 3, Flask 3, Gunicorn |
| External API | GitHub REST API |

## Quick start

Detailed instructions are in the setup guides:

- **Frontend** → [frontend/SETUP.md](frontend/SETUP.md)
- **Backend** → [backend/SETUP.md](backend/SETUP.md)

Short version:

```bash
# 1 — Start the backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
# create .env with GITHUB_TOKEN and SECRET_KEY
python app.py

# 2 — Start the frontend (new terminal)
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) — API calls are automatically proxied to port 5000.

## Project structure

```
nexory-dev/
├─ backend/
│  ├─ app.py            # Flask application (GitHub proxy + language API)
│  ├─ requirements.txt
│  └─ SETUP.md
├─ frontend/
│  ├─ public/
│  │  ├─ .htaccess
│  │  └─ index.html
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ data/
│  │  ├─ i18n/
│  │  ├─ pages/
│  │  └─ styles/
│  ├─ package.json
│  └─ SETUP.md
└─ README.md
```

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/github?endpoint=dashboard` | Org info, top repos, and enriched member list |
| `GET` | `/api/language` | Returns the current language from the session |
| `POST` | `/api/language` | Sets the language (`{"language": "en"}` or `"de"`) |

## Deployment

Build the frontend first:

```bash
cd frontend && npm run build
```

Then deploy `frontend/build/` alongside the Flask backend. Make sure the web server passes `/api/*` requests to Gunicorn and rewrites all other paths to `index.html` (the `.htaccess` in `public/` handles this for Apache/Plesk).

## License

coming soon...

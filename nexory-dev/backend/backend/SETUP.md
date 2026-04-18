# Backend Setup

This guide walks you through running the Python/Flask backend locally.

## Prerequisites

- **Python** 3.10 or newer — [download here](https://www.python.org/)
- A **GitHub personal access token** with `read:org` and `repo` scopes — [create one here](https://github.com/settings/tokens)

## Getting started

1. **Go into the backend folder**

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment** (recommended)

   ```bash
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Create a `.env` file**

   ```bash
   cp .env.example .env   # or just create the file manually
   ```

   Add the following to `.env`:

   ```env
   GITHUB_TOKEN=your_github_token_here
   SECRET_KEY=some-random-secret-string
   ```

   > `SECRET_KEY` is used to sign the session cookie. Pick any long random string.

5. **Run the server**

   ```bash
   python app.py
   ```

   The API is now available at [http://localhost:5000](http://localhost:5000).

## Running in production

Use **Gunicorn** instead of the built-in Flask dev server:

```bash
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/github?endpoint=dashboard` | Org info, top repos, and member list (cached for 120 s) |
| `GET` | `/api/github?endpoint=org` | Raw organisation data |
| `GET` | `/api/github?endpoint=repos` | Public repositories |
| `GET` | `/api/github?endpoint=members` | Organisation members |
| `GET` | `/api/language` | Returns the current language from the session |
| `POST` | `/api/language` | Sets the language (`{"language": "en"}`) |

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `no token` error | Make sure `GITHUB_TOKEN` is set in your `.env` file |
| 502 responses from `/api/github` | Check that your token has the right scopes and hasn't expired |
| CORS errors in the browser | Verify the frontend is running on `http://localhost:3000` |

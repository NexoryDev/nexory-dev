# Frontend Setup

This guide walks you through running the React frontend locally.

## Prerequisites

- **Node.js** 18 or newer — [download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- The **backend** running on port 5000 (see `../backend/SETUP.md`)

## Getting started

1. **Go into the frontend folder**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   npm install lucide-react
   ```

3. **Start the dev server**

   ```bash
   npm start
   ```

   The app opens automatically at [http://localhost:3000](http://localhost:3000).  
   API calls are proxied to `http://localhost:5000`, so make sure the backend is running first.

## Building for production

```bash
npm run build
```

The optimised output lands in `frontend/build/`. Upload that folder (together with the backend) to your server.

## Project layout

```
frontend/
├─ public/
│  ├─ .htaccess       # URL rewrite rules for Apache/Plesk
│  └─ index.html
└─ src/
   ├─ components/     # Shared UI components
   ├─ context/        # React context providers
   ├─ data/           # Static data files
   ├─ i18n/           # Translation strings (de / en)
   ├─ pages/          # Page components (Home, GitHub, Contact, …)
   └─ styles/         # Global and component CSS
```

## Switching language

The app supports **German** and **English**. The active language is stored server-side via the `/api/language` endpoint and also reflected in the UI toggle.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| API calls return 404 | Make sure the backend is running on port 5000 |
| White screen on reload | The `.htaccess` file must rewrite all routes to `index.html` — check your web server config |
| `npm install` fails | Delete `node_modules` and `package-lock.json`, then try again |

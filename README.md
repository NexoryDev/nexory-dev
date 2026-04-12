# nexory-dev

Website-Repository für nexory-dev.de.

Das Projekt besteht aus einem React-Frontend und kleinen PHP-API-Endpunkten fuer GitHub-Daten und Spracheinstellungen.

## Was ist enthalten

- React SPA mit Seiten fuer Home, GitHub, Kontakt und Rechtstexte
- i18n (Deutsch/Englisch) im Frontend
- PHP-Proxy fuer GitHub API (inkl. kurzer Server-Cache)
- PHP-Session-Endpunkt fuer Sprache

## Tech-Stack

- React 18 (Create React App)
- React Router
- PHP 8.x (API-Endpunkte in frontend/public/api)
- GitHub REST API

## Schnellstart

Eine kurze, alltagstaugliche Anleitung findest du in [SETUP.md](SETUP.md).

Kurzfassung:

1. Repository klonen
2. Frontend-Abhaengigkeiten installieren
3. PHP-API lokal auf Port 8080 starten
4. React Dev Server starten

## Projektstruktur

```text
nexory-dev/
├─ frontend/
│  ├─ public/
│  │  ├─ api/
│  │  │  ├─ github.php
│  │  │  └─ language.php
│  │  └─ index.html
│  ├─ src/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ i18n/
│  │  ├─ pages/
│  │  └─ styles/
│  └─ package.json
├─ README.md
└─ SETUP.md
```

## API-Ueberblick

- GET /api/github.php?endpoint=dashboard
	- liefert Organisations-, Repo- und Memberdaten fuer die GitHub-Seite
- GET /api/language.php
	- liefert aktuelle Sprache aus der Session
- POST /api/language.php
	- speichert Sprache in der Session

## Deployment-Hinweis

Fuer Produktion liegt ein Build unter frontend/build. Falls in Plesk deployed wird, muessen die API-Dateien unter einem durch PHP ausfuehrbaren Pfad liegen (z. B. /api), damit Endpunkte wie /api/github.php funktionieren.

## Lizenz

Aktuell ist keine Lizenzdatei im Repository hinterlegt.
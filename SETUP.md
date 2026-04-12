# Setup Guide

Diese Anleitung ist fuer lokale Entwicklung mit React-Frontend plus PHP-API gedacht.

## Voraussetzungen

- Node.js 18+ und npm
- PHP 8.x (CLI reicht fuer lokale API)
- Git

## 1) Repository klonen

```bash
git clone https://github.com/NexoryDev/nexory-dev.git
cd nexory-dev
```

## 2) Frontend installieren

```bash
cd frontend
npm install
```

## 3) GitHub Token fuer API setzen

Der Endpunkt /api/github.php erwartet GITHUB_TOKEN.

Variante A (empfohlen lokal):

Erstelle frontend/.env mit z. B.:

```env
GITHUB_TOKEN=ghp_xxx
```

Variante B:

Setze eine Umgebungsvariable im System oder in der Shell.

## 4) PHP-API lokal starten (Port 8080)

Im Ordner frontend/public:

```bash
php -S localhost:8080
```

Warum 8080?

Das React-Projekt nutzt in package.json einen Proxy auf http://localhost:8080. Dadurch laufen Aufrufe auf /api/* im Dev-Modus automatisch gegen den PHP-Server.

## 5) React Dev Server starten (Port 3000)

In einem zweiten Terminal, im Ordner frontend:

```bash
npm start
```

Danach ist die App unter http://localhost:3000 erreichbar.

## 6) Production Build

```bash
cd frontend
npm run build
```

Build-Ausgabe liegt in frontend/build.

## 7) Deployment (Plesk, Kurzfassung)

1. Build-Inhalt nach httpdocs deployen
2. Sicherstellen, dass PHP fuer /api/github.php und /api/language.php ausgefuehrt wird
3. Falls ein Reverse Proxy genutzt wird: Weiterleitungen und Caching-Regeln fuer SPA und API sauber trennen

## Verfuegbare API-Endpunkte

| Endpunkt | Methode | Beschreibung |
|---|---|---|
| /api/github.php?endpoint=dashboard | GET | Aggregierte GitHub-Daten fuer die Seite |
| /api/language.php | GET | Aktuelle Sprache aus Session lesen |
| /api/language.php | POST | Sprache in Session schreiben |

## Haeufige Fehler

- API liefert 500 Missing GITHUB_TOKEN:
	- Token fehlt oder .env liegt am falschen Ort
- API-Aufrufe schlagen in Dev fehl:
	- PHP-Server laeuft nicht auf Port 8080
- Sprache bleibt nicht erhalten:
	- Browser blockiert Session-Cookies

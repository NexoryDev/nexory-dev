# Setup Guide

## Voraussetzungen

Folgende Programme müssen lokal installiert sein:

- [Node.js 18+](https://nodejs.org) (enthält npm)
- [Git](https://git-scm.com)

---

## Lokale Entwicklung

### 1. Repository klonen

```bash
git clone https://github.com/NexoryDev/nexory-dev.git
cd nexory-dev
```

### 2. Abhängigkeiten installieren

```bash
cd frontend
npm install
```

### 3. Entwicklungsserver starten

```bash
npm start
```

Die Seite ist dann unter `http://localhost:3000` erreichbar.

---

## Produktions-Build erstellen

```bash
cd frontend
npm run build
```

Danach liegt der fertige Build im Ordner `frontend/build/`.

---

## Deployment auf Plesk (Shared Hosting)

### 1. Build als ZIP packen (PowerShell)

```powershell
Compress-Archive -Path "frontend\build\*" -DestinationPath "build.zip" -Force
```

### 2. In Plesk hochladen

1. Plesk → Domain → **Files** → `httpdocs/` öffnen
2. Alten Inhalt löschen
3. `build.zip` hochladen
4. Rechtsklick auf `build.zip` → **Entpacken**
5. Sicherstellen dass `index.html` direkt in `httpdocs/` liegt (nicht in einem Unterordner)

### 3. nginx-Einstellungen in Plesk

Plesk → Domain → **Hosting & DNS** → **Apache & nginx-Einstellungen**:
- **Proxy mode** → aktivieren

### 4. Fertig

Die Seite ist unter der konfigurierten Domain erreichbar.

---

## Projektstruktur

```
nexory-dev/
├── frontend/
│   ├── public/
│   │   ├── api/
│   │   │   ├── contact.php     # Kontaktformular-API
│   │   │   └── language.php    # Sprach-API
│   │   └── .htaccess           # Apache Routing
│   └── src/
│       ├── components/         # Navbar, Footer, Preloader
│       ├── pages/              # Home, GitHub, Contact, Imprint, Privacy
│       ├── styles/             # CSS-Dateien
│       ├── i18n/               # Übersetzungen (de.json, en.json)
│       └── context/            # LanguageContext
└── SETUP.md
```

---

## API-Endpunkte

| Endpunkt | Methode | Beschreibung |
|---|---|---|
| `/api/language` | GET | Aktuelle Sprache abrufen |
| `/api/language` | POST | Sprache setzen (`{"language": "de"}`) |
| `/api/contact` | POST | Kontaktformular absenden |

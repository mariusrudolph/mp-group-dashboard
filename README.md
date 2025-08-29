# Meisterplan Dashboard

Eine moderne **Dark-Mode Web-App** im Apple/Material You Design-Stil, die sich mit der **Meisterplan REST API** verbindet und eine **Liste von Projekten** anhand bestehender Filter/Portfolios anzeigt.

## ✨ Features

- 🎨 **Modernes Dark-Mode Design** mit Glassmorphism-Effekten
- 📊 **Projekt-Übersicht** mit animierten Progress-Balken
- 🔄 **Portfolio-Selector** zum Wechseln zwischen verschiedenen Portfolios
- 📱 **Responsive Design** für alle Geräte
- ⚡ **Framer Motion Animationen** für sanfte Übergänge
- 🛡️ **Server-Side API** als Proxy zu Meisterplan (Token-Sicherheit)

## 🚀 Tech-Stack

- **Next.js 14** mit App Router
- **TypeScript** für Typsicherheit
- **Tailwind CSS** für Styling
- **shadcn/ui** für UI-Komponenten
- **Framer Motion** für Animationen
- **Radix UI** als Basis

## 📋 Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Meisterplan API-Zugang

## 🛠️ Installation

1. **Repository klonen:**
   ```bash
   git clone <repository-url>
   cd mp-simple
   ```

2. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren:**
   
   Erstelle eine `.env.local` Datei im Root-Verzeichnis:
   ```bash
   # Meisterplan API Configuration
   MEISTERPLAN_BASE_URL=https://api.eu.meisterplan.com
   MEISTERPLAN_SYSTEM=subdomain
   MEISTERPLAN_TOKEN=api-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   MEISTERPLAN_PORTFOLIO_NAME=Mein Portfolio-Name
   ```

   **Wichtige Hinweise:**
   - `MEISTERPLAN_BASE_URL`: API-Basis-URL (EU oder US)
   - `MEISTERPLAN_SYSTEM`: Deine Mandanten-Subdomain (z.B. `acme` aus `https://acme.meisterplan.com`)
   - `MEISTERPLAN_TOKEN`: Dein API-Token (beginnt mit `api-`)
   - `MEISTERPLAN_PORTFOLIO_NAME`: Optional - Standard-Portfolio-Name

4. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```

5. **Browser öffnen:**
   ```
   http://localhost:3000
   ```

## 🔧 Konfiguration

### Meisterplan API

Die App verbindet sich mit der Meisterplan REST API über folgende Endpunkte:

- **Portfolios:** `/v1/portfolios`
- **Projekte:** `/v1/projects?portfolioId={id}`

### Umgebungsvariablen

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `MEISTERPLAN_BASE_URL` | API-Basis-URL | `https://api.eu.meisterplan.com` |
| `MEISTERPLAN_SYSTEM` | Mandanten-Subdomain | `acme` |
| `MEISTERPLAN_TOKEN` | API-Token | `api-xxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `MEISTERPLAN_PORTFOLIO_NAME` | Standard-Portfolio | `Mein Portfolio` |

## 📁 Projektstruktur

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── page.tsx          # Dashboard-Hauptseite
│   ├── api/
│   │   └── meisterplan/
│   │       ├── projects/
│   │       │   └── route.ts  # Projekte API-Route
│   │       └── portfolios/
│   │           └── route.ts  # Portfolios API-Route
│   ├── globals.css           # Globale Styles
│   ├── layout.tsx            # Root-Layout
│   └── page.tsx              # Root-Page (Redirect)
├── components/
│   ├── ui/                   # shadcn/ui Komponenten
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   ├── skeleton.tsx
│   │   └── dropdown-menu.tsx
│   └── portfolio-selector.tsx # Portfolio-Auswahl
└── lib/
    ├── meisterplan.ts        # API-Helper
    └── utils.ts              # Utility-Funktionen
```

## 🎨 Design-Features

- **Dark Mode First:** Optimiert für dunkle Umgebungen
- **Glassmorphism:** Subtile Transparenz-Effekte
- **Smooth Animations:** Framer Motion für sanfte Übergänge
- **Responsive Grid:** Adaptives Layout für alle Bildschirmgrößen
- **Focus States:** Klare Interaktions-Feedback

## 🔒 Sicherheit

- **Token-Sicherheit:** API-Token werden nur serverseitig verwendet
- **CORS:** Nur eigene Domain erlaubt
- **Error Handling:** Keine sensiblen Daten im Client-Log

## 🚧 Offene Punkte / TODOs

- [ ] **API-Feldnamen validieren:** Exakte Feldnamen für Progress mit OpenAPI abgleichen
- [ ] **Query-Parameter:** Portfolio-Filter-Parameter mit API-Doku abgleichen
- [ ] **Sortierung:** Projekte nach verschiedenen Kriterien sortieren
- [ ] **Suche:** Projekt-Suchfunktionalität
- [ ] **Pagination:** Bei vielen Projekten

## 🐛 Fehlerbehebung

### Häufige Probleme

1. **"Kein Portfolio gefunden"**
   - Überprüfe `MEISTERPLAN_PORTFOLIO_NAME` in `.env.local`
   - Stelle sicher, dass der Portfolio-Name exakt stimmt

2. **API-Fehler 401/403**
   - Überprüfe `MEISTERPLAN_TOKEN`
   - Stelle sicher, dass der Token gültig ist

3. **API-Fehler 404**
   - Überprüfe `MEISTERPLAN_BASE_URL`
   - Stelle sicher, dass die API-Endpunkte korrekt sind

4. **"X-Meisterplan-System Header" Fehler**
   - Überprüfe `MEISTERPLAN_SYSTEM`
   - Stelle sicher, dass die Subdomain korrekt ist

### Debug-Modus

Aktiviere Debug-Logs in der Konsole:
```typescript
// In lib/meisterplan.ts
console.log('API Request:', `${mp.baseUrl}${path}`);
console.log('Headers:', mpHeaders());
```

## 📚 API-Referenz

### Meisterplan REST API

- **Dokumentation:** [Meisterplan Developer Portal](https://developer.meisterplan.com)
- **Endpunkte:** `/v1/portfolios`, `/v1/projects`
- **Authentifizierung:** Bearer Token
- **Headers:** `X-Meisterplan-System` für Mandanten-Identifikation

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 🆘 Support

Bei Fragen oder Problemen:

1. Überprüfe die [Fehlerbehebung](#-fehlerbehebung)
2. Schaue in die [Issues](../../issues)
3. Erstelle ein neues Issue mit detaillierter Beschreibung

---

**Entwickelt mit ❤️ für die Meisterplan-Community**

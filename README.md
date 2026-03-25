# Fleet Checklist

Production-minded MVP for **daily truck and forklift inspections**: vehicles, checklists with week status (Mon–Sun), issue warnings with optional notes, history, CSV/PDF export, and editable checklist templates.

## Stack

- React 19 + Vite 8
- React Router 7
- Firebase Auth, Firestore (optional Analytics)
- Styling: CSS modules + global CSS (no Tailwind)
- PDF: [jsPDF](https://github.com/parallax/jsPDF)

## Run locally

```bash
npm install
cp .env.example .env.local
# Fill in Firebase config in .env.local (see below)
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview   # optional: serve production build locally
```

## Firebase setup

1. In [Firebase Console](https://console.firebase.google.com/), create a project (or use an existing one).
2. **Enable Authentication** → Sign-in method: **Email/Password** (and optionally **Anonymous** for “Continue without account”).
3. **Create a Firestore database** (production mode is fine; deploy rules from this repo).
4. **Web app** → Register app → copy config into `.env.local`.
5. **Firestore rules**: deploy `firestore.rules` from this project (or paste into the console Rules tab).
6. **Indexes**: Firestore may prompt for composite indexes when you first run queries. You can also deploy `firestore.indexes.json` with the Firebase CLI:

   ```bash
   firebase deploy --only firestore:indexes
   ```

   Typical indexes needed:

   - `vehicles`: `createdBy` + `updatedAt` (descending)
   - `checks`: `createdBy` + `vehicleId` + `dateKey` (range)
   - `checks`: `createdBy` + `dateKey` (range)

7. **First run**: sign in, open **Settings** → **Seed default checklist templates** (creates the Truck and Forklift templates).

### Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

## App flow

1. **Home** — vehicles list; **Add vehicle**; **History**; **Settings**.
2. **Vehicle** — details + **Start checklist**.
3. **Checklist** — week navigator, Mon–Sun circles (grey / green / red), tap items to cycle: unchecked → good → issue → unchecked. **Issue** opens a warning modal with an optional note. **Save checklist** saves partial progress.
4. **History** — filter by vehicle and date range; **Export CSV** / **Export PDF**.
5. **Settings** — edit Truck/Forklift templates (categories, items, reorder); seed/reset templates.

## Mobile / PWA

The UI is mobile-first (large tap targets, sticky save on checklist). The app is a standard SPA; you can wrap it later with Capacitor or similar for a store build.

## Data model (summary)

- `users/{uid}` — profile bootstrap
- `vehicles/{id}` — `{ name, type, registrationId, notes, imageUrl, createdBy, createdAt, updatedAt, active, lastCheck* }`
- `checklistTemplates/{id}` — `{ vehicleType, name, categories[], createdBy, ... }`
- `checks/{id}` — `{ vehicleId, vehicleType, dateKey, weekStartKey, completed, hasIssues, overallStatus, results[], createdBy, ... }`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## License

Private / your project — adjust as needed.

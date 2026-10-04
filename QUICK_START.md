# Quick Start

## Requirements

- Node.js 18–20
- npm

## Run the app

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. No account or backend server is needed. The app creates one profile in this browser and saves its name, habits, completions, and notifications in local storage. This data stays in this browser profile and does not sync to other browsers or devices.

To create a production build:

```bash
npm run build
```

The output is written to `dist/`.

## Existing backend

The `backend/` directory and its SQLite database are retained from the earlier account based version. The current frontend does not connect to them. Existing backend accounts and records have not been migrated or deleted.

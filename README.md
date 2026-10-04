# Habit Tracker

A browser based habit tracker built with Vue 3, Vite, Pinia, and SCSS.

## Features

- Track habits, completions, streaks, and progress
- Use the app without creating an account
- Save one profile and its tracker data in this browser's local storage
- Keep data separate between browser profiles

Local data does not sync across devices or browsers. Anyone with access to the same browser profile can see it. Export and import are not available yet.

## Run locally

Requirements: Node.js 24 and npm.

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Create a production build with `npm run build`; generated files go to `dist/`.

## Data and existing backend

The frontend stores its profile under the `chronos.local-profile.v1` local storage key. It does not read the old account session or unscoped habit keys. Those old browser keys are left untouched.

The `backend/` folder contains the previous Express and SQLite account service. It is not required by the current frontend. Its database and account records are retained without migration or deletion; the current app does not access them.

## Project layout

- `src/views/Dashboard.vue`: habit tracking, calendar, and analytics
- `src/views/Profile.vue`: local profile name
- `src/stores/user.js`: local profile and persistence
- `src/components/`: shared UI components
- `backend/`: retained account API and SQLite database from the earlier version

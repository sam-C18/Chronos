# Project Structure

```text
habit-tracker(chronos)/
├── src/
│   ├── components/       # Navbar, habit card, and habit form
│   ├── stores/user.js    # Local profile and local storage persistence
│   ├── styles/main.scss  # Shared styles
│   ├── views/
│   │   ├── Dashboard.vue # Habits, calendar, and analytics
│   │   └── Profile.vue   # Local profile name settings
│   ├── App.vue
│   └── main.js           # Vue app, routes, and Pinia setup
├── backend/              # Retained account API and SQLite data; not used by current frontend
├── dist/                 # Generated production build
├── IMPLEMENTATION_PLAN.md
├── QUICK_START.md
└── README.md
```

## Data flow

The frontend stores one profile with its habits, completions, and notifications in the current browser profile under `chronos.local-profile.v1`. It does not require authentication or make API requests. Browser profiles keep separate data; it does not sync across devices.

The backend server and SQLite database belong to the earlier account based implementation. They remain in the repository and have not been migrated or deleted, but the current frontend does not access them. Existing records can be addressed separately if account data needs to be migrated later.

## Main files

- `src/main.js`: dashboard and profile routes; `/` and `/login` redirect to the dashboard
- `src/stores/user.js`: reads and writes the local profile
- `src/views/Dashboard.vue`: habit tracking and analytics, with changes saved to the profile
- `src/views/Profile.vue`: edit the locally stored profile name
- `backend/server.js`: retained Express API for the earlier account based app
- `backend/habit_tracker.db`: retained SQLite database; do not delete or migrate without a separate decision

Run `npm install` and `npm run dev` for local development. Run `npm run build` to create `dist/`.

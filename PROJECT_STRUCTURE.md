# Habit Tracker - Project Structure

## 📁 Complete Project Structure

```
habit-tracker(chronos)/
│
├── 📄 LICENSE                    # Proprietary License (Copyright Protection)
├── 📄 README.md                  # Project documentation
├── 📄 PROJECT_STRUCTURE.md       # This file - detailed structure
├── 📄 .gitignore                # Git ignore rules
│
├── 📦 Frontend (Vue.js 3)
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js           # Vite build configuration
│   ├── index.html               # HTML entry point
│   │
│   ├── 📁 src/
│   │   ├── main.js              # Application entry point
│   │   ├── App.vue              # Root Vue component
│   │   ├── config.js            # Environment configuration
│   │   │
│   │   ├── 📁 components/       # Reusable Vue components
│   │   │   ├── Navbar.vue       # Navigation bar with notifications
│   │   │   ├── HabitCard.vue    # Individual habit display card
│   │   │   └── HabitForm.vue    # Create/edit habit form
│   │   │
│   │   ├── 📁 views/            # Page-level components
│   │   │   ├── LoginPage.vue    # Authentication page
│   │   │   ├── Dashboard.vue    # Main dashboard view
│   │   │   └── Profile.vue      # User profile settings
│   │   │
│   │   ├── 📁 stores/           # Pinia state management
│   │   │   └── user.js          # User authentication store
│   │   │
│   │   └── 📁 styles/           # Global styles
│   │       └── main.scss        # SCSS design system & styles
│   │
│   └── 📁 dist/                 # Production build output (generated)
│       ├── index.html
│       └── assets/
│           ├── *.js             # Bundled JavaScript
│           └── *.css            # Bundled CSS
│
├── 📦 Backend (Node.js/Express)
│   ├── package.json             # Backend dependencies
│   ├── server.js                # Express server & API routes
│   ├── habit_tracker.db         # SQLite database file
│   └── 📁 node_modules/          # Backend dependencies (generated)
│
└── 📁 node_modules/             # Frontend dependencies (generated)
```

## 🗂️ Detailed File Descriptions

### Frontend Files

#### Root Level
- **`package.json`**: Frontend package configuration, dependencies, and scripts
- **`vite.config.js`**: Vite bundler configuration with Vue plugin and SCSS support
- **`index.html`**: HTML template that serves as the entry point for the Vue app

#### Source Files (`src/`)

**Core Files:**
- **`main.js`**: Application entry point - initializes Vue app, router, and Pinia store
- **`App.vue`**: Root component that wraps all routes
- **`config.js`**: Environment configuration (API base URL, etc.)

**Components (`src/components/`):**
- **`Navbar.vue`**: 
  - Navigation bar with tabs (Dashboard, Calendar, Analytics, Habits)
  - Notifications dropdown
  - Profile and Logout buttons
  - Responsive design

- **`HabitCard.vue`**: 
  - Displays individual habit information
  - Shows completion status, streaks
  - Edit/delete actions

- **`HabitForm.vue`**: 
  - Form for creating/editing habits
  - Color picker
  - Validation

**Views (`src/views/`):**
- **`LoginPage.vue`**: 
  - User authentication (login/signup)
  - Email validation
  - Form validation and error handling

- **`Dashboard.vue`**: 
  - Main application view
  - Statistics cards
  - Charts (weekly progress, habit distribution, monthly trends)
  - Habit management
  - Calendar view
  - Analytics tab

- **`Profile.vue`**: 
  - User profile settings
  - Email and username management
  - Account information display

**Stores (`src/stores/`):**
- **`user.js`**: 
  - Pinia store for user authentication state
  - User data management
  - LocalStorage persistence

**Styles (`src/styles/`):**
- **`main.scss`**: 
  - Global SCSS variables (colors, fonts, spacing)
  - Design system utilities
  - Component styles
  - Animations and transitions
  - Responsive breakpoints

### Backend Files

**`backend/server.js`**: 
- Express server setup
- Database initialization (SQLite)
- API endpoints:
  - Authentication: `/api/signup`, `/api/login`, `/api/check-email`
  - User: `/api/user/profile`
  - Habits: `/api/habits` (GET, POST, PUT, DELETE)
  - Completions: `/api/completions` (GET, POST)
  - Notifications: `/api/notifications` (GET, POST, PUT)

**`backend/package.json`**: 
- Backend dependencies (Express, SQLite3, bcrypt, CORS, etc.)
- Scripts for running server

**`backend/habit_tracker.db`**: 
- SQLite database file
- Tables: users, habits, completions, notifications

## 🔧 Configuration Files

### Environment Variables

**Frontend** (`.env` in root):
```env
VITE_API_BASE_URL=http://localhost:3000
```

**Backend** (`.env` in `backend/`):
```env
PORT=3000
```

## 📊 Database Schema

### Tables

1. **users**
   - `id` (INTEGER PRIMARY KEY)
   - `email` (TEXT UNIQUE)
   - `name` (TEXT)
   - `password` (TEXT - bcrypt hashed)
   - `created_at` (DATETIME)

2. **habits**
   - `id` (INTEGER PRIMARY KEY)
   - `user_id` (INTEGER - Foreign Key)
   - `name` (TEXT)
   - `description` (TEXT)
   - `frequency` (TEXT)
   - `color` (TEXT)
   - `created_at` (DATETIME)

3. **completions**
   - `id` (INTEGER PRIMARY KEY)
   - `habit_id` (INTEGER - Foreign Key)
   - `user_id` (INTEGER - Foreign Key)
   - `date` (TEXT)
   - `completed` (BOOLEAN)

4. **notifications**
   - `id` (INTEGER PRIMARY KEY)
   - `user_id` (INTEGER - Foreign Key)
   - `message` (TEXT)
   - `type` (TEXT)
   - `read` (BOOLEAN)
   - `timestamp` (DATETIME)

## 🚀 Deployment Structure

### Production Build
```
dist/
├── index.html
└── assets/
    ├── index-[hash].js    # Bundled JavaScript
    └── index-[hash].css   # Bundled CSS
```

### Backend Deployment
- `backend/` folder contains all server files
- `habit_tracker.db` is created automatically
- Requires Node.js runtime environment

## 📦 Dependencies

### Frontend Dependencies
- **vue**: ^3.4.0 - Vue.js framework
- **vue-router**: ^4.2.5 - Client-side routing
- **pinia**: ^2.1.7 - State management
- **axios**: ^1.6.2 - HTTP client
- **date-fns**: ^2.30.0 - Date manipulation
- **chart.js**: ^4.4.0 - Chart library
- **vue-chartjs**: ^5.3.0 - Vue wrapper for Chart.js

### Backend Dependencies
- **express**: ^4.18.2 - Web framework
- **sqlite3**: ^5.1.6 - SQLite database
- **bcrypt**: ^5.1.1 - Password hashing
- **cors**: ^2.8.5 - Cross-origin resource sharing
- **body-parser**: ^1.20.2 - Request body parsing
- **dotenv**: ^17.2.3 - Environment variables

## 🔐 Security Considerations

1. **Password Hashing**: bcrypt with salt rounds
2. **CORS**: Configured for cross-origin requests
3. **Data Isolation**: User-specific data queries
4. **Input Validation**: Email validation, required fields
5. **SQL Injection**: Parameterized queries

## 📝 Notes

- The `dist/` folder is generated by `npm run build` and should not be committed
- The `node_modules/` folders are generated and should not be committed
- The database file `habit_tracker.db` should be backed up regularly
- Environment variables should be set for production deployment


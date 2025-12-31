# Quick Start Guide - Habit Tracker

## 🏃 Get Started in 5 Minutes

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Step 1: Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### Step 2: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend runs on: `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

### Step 3: Access Application

Open your browser and go to: `http://localhost:5173`

## 📁 Project Structure Overview

```
habit-tracker(chronos)/
├── src/                    # Frontend Vue.js application
│   ├── components/         # Reusable components
│   ├── views/             # Page components
│   ├── stores/            # State management
│   └── styles/            # Global styles
├── backend/               # Node.js/Express API
│   ├── server.js          # Main server file
│   └── habit_tracker.db   # SQLite database
└── dist/                  # Production build (generated)
```

## 🔑 Key Files

- **Frontend Entry**: `src/main.js`
- **Backend Entry**: `backend/server.js`
- **Config**: `src/config.js`
- **Styles**: `src/styles/main.scss`

## 🚀 Build for Production

```bash
npm run build
```

Output: `dist/` folder

## 📚 Documentation

- **Full Structure**: See `PROJECT_STRUCTURE.md`
- **Deployment**: See `DEPLOYMENT.md`
- **License**: See `LICENSE`

## ⚙️ Configuration

### Frontend API URL
Edit `src/config.js` or set environment variable:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Backend Port
Edit `backend/.env`:
```env
PORT=3000
```

## 🐛 Common Issues

**Port already in use:**
- Change PORT in backend/.env
- Or kill the process using the port

**Database errors:**
- Database file is created automatically
- Check file permissions if issues occur

**CORS errors:**
- Verify backend CORS settings
- Check API URL in frontend config

## 📦 Tech Stack

- **Frontend**: Vue.js 3, Vue Router, Pinia, Vite
- **Backend**: Node.js, Express, SQLite
- **Styling**: SCSS
- **HTTP**: Axios

## 🎯 Next Steps

1. Read `PROJECT_STRUCTURE.md` for detailed information
2. Check `DEPLOYMENT.md` for production deployment
3. Review `LICENSE` for usage terms


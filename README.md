# Habit Tracker - Vue.js Web App

A beautiful, minimal habit tracking web application built with Vue.js 3, featuring a black & white aesthetic with grainy textures and glassmorphism effects.

## Features

- **🔐 Authentication**: Secure login/signup with email verification and account validation
- **�️ Data Isolation**: Strict user data separation - each user only sees their own data
- **📊 Dashboard**: Overview of habits, streaks, and progress with visual charts
- **📅 Calendar View**: Weekly calendar to track daily habit completion
- **📈 Analytics**: Detailed analytics and performance tracking
- **➕ Habit Management**: Create, edit, and delete habits with custom colors
- **🔔 Notifications**: Motivational messages and progress updates
- **💾 Database Storage**: Data persistence using SQLite database with user-specific tables
- **📱 Responsive**: Mobile-friendly design

## Design Features

- **Black & White Aesthetic**: Minimal, elegant color scheme
- **Grainy Textures**: Subtle noise overlay for depth
- **Glassmorphism**: Blurred glass effects with backdrop-filter
- **Smooth Animations**: Vue transitions and CSS animations
- **Typography**: Playfair Display (serif) and Space Grotesk (sans-serif)
- **White Space**: Clean layout with generous spacing

## Tech Stack

- **Frontend**: Vue.js 3 with Composition API
- **Backend**: Node.js with Express
- **Database**: SQLite
- **Authentication**: bcrypt for password hashing
- **Build Tool**: Vite
- **Styling**: SCSS with custom design system
- **Routing**: Vue Router
- **State Management**: Pinia
- **Date Handling**: date-fns
- **Charts**: Custom SVG implementations (no external chart library)
- **HTTP Client**: Axios

## Project Structure

```
habit-tracker/
├── backend/
│   ├── server.js               # Express server with authentication APIs
│   └── package.json            # Backend dependencies
├── src/
│   ├── components/
│   │   ├── Navbar.vue          # Navigation with notifications
│   │   ├── HabitCard.vue       # Individual habit display
│   │   └── HabitForm.vue       # Create/edit habit form
│   ├── views/
│   │   ├── LoginPage.vue       # Authentication page with validation
│   │   └── Dashboard.vue       # Main application view
│   ├── styles/
│   │   └── main.scss           # Global styles and design system
│   ├── App.vue                 # Root component
│   └── main.js                 # Application entry point
├── index.html                  # HTML template
├── package.json                # Frontend dependencies
└── vite.config.js             # Vite configuration
```

## Installation & Setup

1. **Install frontend dependencies**:
   ```bash
   npm install
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```
   The backend will run on http://localhost:3000

4. **Start the frontend development server** (in a new terminal):
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:5173

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Preview production build**:
   ```bash
   npm run preview
   ```

## Deployment

### Frontend Deployment

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Environment Configuration**:
   Create a `.env` file in the root directory:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```

3. **Deploy the `dist` folder** to your static hosting service (Netlify, Vercel, etc.)

### Backend Deployment

1. **Environment Configuration**:
   Create a `.env` file in the `backend` directory:
   ```
   PORT=3000
   ```

2. **Deploy to a server** (Heroku, Railway, DigitalOcean, etc.)

### Full-Stack Deployment Example

For platforms like Railway or Render:

1. **Backend**: Deploy the `backend` folder as a Node.js service
2. **Frontend**: Deploy the built `dist` folder as a static site
3. **Database**: SQLite will create a local database file

Make sure to update the `VITE_API_BASE_URL` in the frontend to point to your deployed backend URL.

## Authentication System

The app includes a comprehensive email verification and account validation system with strict data isolation:

- **Email Existence Check**: Validates whether an email already exists in the database
- **Duplicate Prevention**: Prevents creation of multiple accounts with the same email
- **Frontend Validation**: Real-time email checking with user feedback
- **Backend Enforcement**: Server-side validation to ensure data integrity
- **Secure Passwords**: Passwords are hashed using bcrypt before storage
- **Data Isolation**: Each user can only access their own habits, completions, and notifications
- **Session Management**: User data is cleared on login/logout to prevent cross-user contamination

### API Endpoints

- `GET /api/check-email?email=<email>`: Check if email exists
- `POST /api/signup`: Create new account
- `POST /api/login`: Authenticate user
- `GET /api/habits`: Get user's habits
- `POST /api/habits`: Create new habit
- `PUT /api/habits/:id`: Update habit
- `DELETE /api/habits/:id`: Delete habit
- `GET /api/completions`: Get user's completions
- `POST /api/completions`: Update completion status
- `GET /api/notifications`: Get user's notifications
- `POST /api/notifications`: Create notification
- `PUT /api/notifications/:id/read`: Mark notification as read

## Usage

1. **Sign Up**: Enter a unique email and password to create an account
2. **Email Validation**: The system checks if the email is already registered
3. **Login**: Use your registered email and password to access the app
4. **Create Habits**: Click "New Habit" to add your first habit
5. **Track Progress**: Mark habits as complete in the calendar view
6. **View Analytics**: Check your progress and streaks in the analytics tab
7. **Stay Motivated**: Receive notifications and motivational messages

## Key Components

### Dashboard
- Statistics cards showing total habits, current streak, and completion rate
- Weekly progress bar chart
- Habit distribution pie chart
- Monthly trend line chart

### Calendar
- Weekly view with habit completion tracking
- Click habits to mark as complete/incomplete
- Navigate between weeks
- Visual indicators for today and completed habits

### Analytics
- Completion trends over time
- Individual habit performance metrics
- Weekly distribution analysis
- Streak calculations

### Habits Management
- Create new habits with custom colors
- Edit existing habits
- Delete habits
- View completion rates and streaks

## Design System

The app uses a custom design system with:

- **Colors**: Black, white, and gray shades only
- **Typography**: Playfair Display for headings, Space Grotesk for body text
- **Spacing**: Consistent spacing scale (0.25rem to 2rem)
- **Components**: Reusable button, card, input, and form components
- **Effects**: Glassmorphism, grain overlays, smooth transitions

## Browser Support

- Chrome/Edge 88+
- Firefox 87+
- Safari 14+

## License

MIT License - feel free to use this project for personal or commercial purposes.

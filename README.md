# Habit Tracker - Vue.js Web App

A beautiful, minimal habit tracking web application built with Vue.js 3, featuring a black & white aesthetic with grainy textures and glassmorphism effects.

## Features

- **🔐 Authentication**: Clean login/signup page with smooth transitions
- **📊 Dashboard**: Overview of habits, streaks, and progress with visual charts
- **📅 Calendar View**: Weekly calendar to track daily habit completion
- **📈 Analytics**: Detailed analytics and performance tracking
- **➕ Habit Management**: Create, edit, and delete habits with custom colors
- **🔔 Notifications**: Motivational messages and progress updates
- **💾 Local Storage**: Data persistence using browser localStorage
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
- **Build Tool**: Vite
- **Styling**: SCSS with custom design system
- **Routing**: Vue Router
- **State Management**: Pinia
- **Date Handling**: date-fns
- **Charts**: Custom SVG implementations (no external chart library)

## Project Structure

```
habit-tracker/
├── src/
│   ├── components/
│   │   ├── Navbar.vue          # Navigation with notifications
│   │   ├── HabitCard.vue       # Individual habit display
│   │   └── HabitForm.vue       # Create/edit habit form
│   ├── views/
│   │   ├── LoginPage.vue       # Authentication page
│   │   └── Dashboard.vue       # Main application view
│   ├── styles/
│   │   └── main.scss           # Global styles and design system
│   ├── App.vue                 # Root component
│   └── main.js                 # Application entry point
├── index.html                  # HTML template
├── package.json                # Dependencies
└── vite.config.js             # Vite configuration
```

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Usage

1. **Login**: Use any email and password to access the app
2. **Create Habits**: Click "New Habit" to add your first habit
3. **Track Progress**: Mark habits as complete in the calendar view
4. **View Analytics**: Check your progress and streaks in the analytics tab
5. **Stay Motivated**: Receive notifications and motivational messages

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

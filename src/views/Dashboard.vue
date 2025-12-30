<template>
  <div class="dashboard">
    <div class="grain-overlay"></div>
    
    <Navbar 
      :active-tab="activeTab" 
      :notifications="notifications"
      @tab-change="setActiveTab"
    />
    
    <div class="dashboard-content">
      <div class="container">
        <!-- Dashboard Tab -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'dashboard'" key="dashboard" class="dashboard-tab notion-dashboard">
            <!-- Dashboard Header -->
            <div class="dashboard-header">
              <div>
                <h1 class="dashboard-page-title font-display">
                  {{ getGreeting() }}! 👋
                </h1>
                <p class="dashboard-page-subtitle">
                  {{ getMotivationalMessage() }}
                </p>
              </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="notion-stats-grid">
              <div class="notion-stat-card animate-fade-in-up animate-stagger-1">
                <div class="stat-icon">📋</div>
                <div class="stat-content">
                  <div class="stat-label">Total Habits</div>
                  <div class="stat-value-large">{{ habits.length }}</div>
                </div>
              </div>
              <div class="notion-stat-card animate-fade-in-up animate-stagger-2">
                <div class="stat-icon">🔥</div>
                <div class="stat-content">
                  <div class="stat-label">Current Streak</div>
                  <div class="stat-value-large">{{ maxStreak }}</div>
                  <div class="stat-hint">{{ maxStreak === 1 ? 'day' : 'days' }}</div>
                </div>
              </div>
              <div class="notion-stat-card animate-fade-in-up animate-stagger-3">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                  <div class="stat-label">Completion Rate</div>
                  <div class="stat-value-large">{{ completionRate }}%</div>
                  <div class="stat-hint" :class="completionRate >= 70 ? 'positive' : completionRate >= 50 ? 'neutral' : 'negative'">
                    {{ completionRate >= 70 ? 'Excellent' : completionRate >= 50 ? 'Good' : 'Keep going' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Weekly Progress Chart -->
            <div class="notion-card notion-chart-card">
              <div class="notion-card-header">
                <div>
                  <h3 class="notion-card-title">Weekly Progress</h3>
                  <p class="notion-card-subtitle">Your habit completion over the past week</p>
                </div>
              </div>
              <div class="notion-card-content">
                <div class="chart-container notion-chart">
                  <div v-if="weeklyStats.length === 0" class="chart-placeholder notion-placeholder">
                    <div class="placeholder-icon">📊</div>
                    <p>No data available yet</p>
                    <p class="placeholder-hint">Complete some habits to see your progress</p>
                  </div>
                  <div v-else>
                    <Bar 
                      :data="weeklyChartData" 
                      :options="weeklyChartOptions"
                      style="height: 320px;"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Charts Grid -->
            <div class="notion-grid">
              <div class="notion-card notion-chart-card">
                <div class="notion-card-header">
                  <h3 class="notion-card-title">Habit Distribution</h3>
                  <p class="notion-card-subtitle">Spread across your habits</p>
                </div>
                <div class="notion-card-content">
                  <div class="pie-chart notion-chart">
                    <div v-if="habits.length === 0" class="chart-placeholder notion-placeholder">
                      <div class="placeholder-icon">📊</div>
                      <p>No habits created yet</p>
                    </div>
                    <div v-else>
                      <Doughnut 
                        :data="habitDistributionData" 
                        :options="habitDistributionOptions"
                        style="height: 280px;"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="notion-card notion-chart-card">
                <div class="notion-card-header">
                  <h3 class="notion-card-title">Monthly Trend</h3>
                  <p class="notion-card-subtitle">Completion ratio over time</p>
                </div>
                <div class="notion-card-content">
                  <div class="line-chart notion-chart">
                    <div v-if="monthlyProgress.length === 0" class="chart-placeholder notion-placeholder">
                      <div class="placeholder-icon">📈</div>
                      <p>No progress data available</p>
                    </div>
                    <div v-else>
                      <Line 
                        :data="monthlyChartData" 
                        :options="monthlyChartOptions"
                        style="height: 280px;"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
        <!-- Calendar Tab -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'calendar'" key="calendar" class="calendar-tab notion-calendar">
            <div class="calendar-header notion-header">
              <div>
                <h1 class="calendar-page-title font-display">
                  {{ formatDate(selectedDate, 'MMMM yyyy') }}
                </h1>
                <p class="calendar-page-subtitle">Track your habits week by week</p>
              </div>
              <div class="calendar-controls notion-controls">
                <button @click="previousWeek" class="notion-btn notion-btn-outline">
                  ← Previous
                </button>
                <button @click="goToToday" class="notion-btn notion-btn-primary">
                  Today
                </button>
                <button @click="nextWeek" class="notion-btn notion-btn-outline">
                  Next →
                </button>
              </div>
            </div>
            
            <div class="notion-card notion-calendar-card">
              <div class="notion-calendar-grid">
                <div class="notion-calendar-header-row">
                  <div 
                    v-for="day in weekDays" 
                    :key="day.toISOString()" 
                    class="notion-calendar-day-header"
                  >
                    {{ formatDate(day, 'EEE') }}
                  </div>
                </div>
                
                <div class="notion-calendar-body">
                  <div 
                    v-for="day in weekDays" 
                    :key="day.toISOString()"
                    :class="[
                      'notion-calendar-day',
                      { 'notion-calendar-day-today': isToday(day) }
                    ]"
                  >
                    <div class="notion-calendar-day-number">
                      <span :class="{ 'notion-today-highlight': isToday(day) }">
                        {{ formatDate(day, 'd') }}
                      </span>
                    </div>
                    
                    <div class="notion-calendar-habits">
                      <button
                        v-for="habit in habits"
                        :key="habit.id"
                        @click="toggleHabitCompletion(habit.id, day)"
                        :class="[
                          'notion-habit-button',
                          { 'notion-habit-completed': getHabitCompletion(habit.id, day)?.completed }
                        ]"
                        :style="{ borderLeft: `3px solid ${habit.color}` }"
                      >
                        {{ habit.name }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
        <!-- Analytics Tab -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'analytics'" key="analytics" class="analytics-tab animate-fade-in-up">
            <!-- Analytics Header -->
            <div class="analytics-header">
              <div>
                <h1 class="analytics-page-title font-display">Analytics</h1>
                <p class="analytics-page-subtitle">Track your progress and discover insights</p>
              </div>
            </div>

            <!-- Key Metrics Grid -->
            <div class="metrics-grid">
              <div class="metric-card notion-card animate-fade-in-up animate-stagger-1">
                <div class="metric-icon">📊</div>
                <div class="metric-content">
                  <div class="metric-label">Total Habits</div>
                  <div class="metric-value">{{ habits.length }}</div>
                  <div class="metric-change positive" v-if="habits.length > 0">
                    Active tracking
                  </div>
                </div>
              </div>

              <div class="metric-card notion-card animate-fade-in-up animate-stagger-2">
                <div class="metric-icon">🔥</div>
                <div class="metric-content">
                  <div class="metric-label">Current Streak</div>
                  <div class="metric-value">{{ maxStreak }}</div>
                  <div class="metric-change positive" v-if="maxStreak > 0">
                    {{ maxStreak === 1 ? 'day' : 'days' }} strong
                  </div>
                  <div class="metric-change" v-else>
                    Start building your streak
                  </div>
                </div>
              </div>

              <div class="metric-card notion-card animate-fade-in-up animate-stagger-3">
                <div class="metric-icon">✅</div>
                <div class="metric-content">
                  <div class="metric-label">Completion Rate</div>
                  <div class="metric-value">{{ completionRate }}%</div>
                  <div class="metric-change" :class="completionRate >= 70 ? 'positive' : completionRate >= 50 ? 'neutral' : 'negative'">
                    {{ completionRate >= 70 ? 'Excellent' : completionRate >= 50 ? 'Good progress' : 'Room for improvement' }}
                  </div>
                </div>
              </div>

              <div class="metric-card notion-card animate-fade-in-up animate-stagger-4">
                <div class="metric-icon">📈</div>
                <div class="metric-content">
                  <div class="metric-label">Weekly Average</div>
                  <div class="metric-value">{{ getWeeklyAverage() }}%</div>
                  <div class="metric-change" :class="getWeeklyAverage() >= 70 ? 'positive' : 'neutral'">
                    This week's performance
                  </div>
                </div>
              </div>
            </div>

            <!-- Main Chart Section -->
            <div class="notion-card notion-chart-card animate-fade-in-up animate-stagger-1">
              <div class="notion-card-header">
                <div>
                  <h3 class="notion-card-title">Completion Trends</h3>
                  <p class="notion-card-subtitle">Daily completion ratio over the past month</p>
                </div>
              </div>
              <div class="notion-card-content">
                <div class="line-chart notion-chart">
                  <div v-if="monthlyProgress.length === 0" class="chart-placeholder notion-placeholder">
                    <div class="placeholder-icon">📊</div>
                    <p>Analytics will appear once you start tracking habits</p>
                    <p class="placeholder-hint">Complete a few habits to see your progress trends</p>
                  </div>
                  <div v-else>
                    <Line 
                      :data="monthlyChartData" 
                      :options="monthlyChartOptions"
                      style="height: 320px;"
                    />
                  </div>
                </div>
                <div v-if="monthlyProgress.length > 0" class="notion-insight-box">
                  <div class="insight-icon">💡</div>
                  <p class="insight-text">{{ generateCompletionInsight() }}</p>
                </div>
              </div>
            </div>
            
            <!-- Analytics Grid -->
            <div class="analytics-grid notion-grid">
              <!-- Habit Performance -->
              <div class="notion-card notion-chart-card animate-fade-in-up animate-stagger-2">
                <div class="notion-card-header">
                  <h3 class="notion-card-title">Habit Performance</h3>
                  <p class="notion-card-subtitle">Ranked by consistency this week</p>
                </div>
                <div class="notion-card-content">
                  <div class="performance-list notion-list">
                    <div 
                      v-for="(habit, index) in sortedHabitsByConsistency"
                      :key="habit.id"
                      class="performance-item notion-list-item"
                      @click="showHabitDetails(habit)"
                    >
                      <div class="performance-rank">{{ index + 1 }}</div>
                      <div class="performance-content">
                        <div class="performance-header">
                          <span class="performance-name">{{ habit.name }}</span>
                          <span class="performance-percentage">{{ getWeeklyCompletionPercentage(habit.id) }}%</span>
                        </div>
                        <div class="performance-bar-container notion-bar">
                          <div 
                            class="performance-bar notion-bar-fill" 
                            :style="{ width: getWeeklyCompletionPercentage(habit.id) + '%', backgroundColor: habit.color }"
                          ></div>
                        </div>
                        <div class="performance-insight">
                          <span class="insight-text">{{ getHabitInsight(habit.id) }}</span>
                        </div>
                      </div>
                    </div>
                    <div v-if="sortedHabitsByConsistency.length === 0" class="notion-empty-state">
                      <div class="empty-icon">📝</div>
                      <p>No habits to analyze yet</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Weekly Distribution -->
              <div class="notion-card notion-chart-card animate-fade-in-up animate-stagger-3">
                <div class="notion-card-header">
                  <h3 class="notion-card-title">Weekly Distribution</h3>
                  <p class="notion-card-subtitle">How your completions are spread across habits</p>
                </div>
                <div class="notion-card-content">
                  <div class="pie-chart notion-chart">
                    <div v-if="weeklyStats.length === 0" class="chart-placeholder notion-placeholder">
                      <div class="placeholder-icon">📊</div>
                      <p>No data available yet</p>
                    </div>
                    <div v-else>
                      <div class="donut-container">
                        <Doughnut 
                          :data="weeklyDistributionData" 
                          :options="weeklyDistributionOptions"
                          style="height: 280px;"
                        />
                        <div class="donut-center-label">
                          <span class="center-text">Focus</span>
                        </div>
                      </div>
                      <div class="donut-legend notion-legend">
                        <div 
                          v-for="(stat, index) in weeklyStats" 
                          :key="stat.habit"
                          class="legend-item notion-legend-item"
                          :class="{ 'legend-item-highlighted': hoveredSegment === index }"
                          @mouseenter="hoveredSegment = index"
                          @mouseleave="hoveredSegment = null"
                        >
                          <div class="legend-color" :style="{ backgroundColor: stat.color }"></div>
                          <span class="legend-name">{{ stat.habit }}</span>
                          <span class="legend-percentage">{{ Math.round((stat.completed / stat.total) * 100) }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Additional Insights -->
            <div class="notion-card notion-insights-card animate-fade-in-up animate-stagger-4">
              <div class="notion-card-header">
                <h3 class="notion-card-title">Insights</h3>
              </div>
              <div class="notion-card-content">
                <div class="insights-grid">
                  <div class="insight-item" v-if="habits.length > 0">
                    <div class="insight-icon-small">🎯</div>
                    <div class="insight-content">
                      <div class="insight-title">Most Consistent</div>
                      <div class="insight-value">{{ getMostConsistentHabit() }}</div>
                    </div>
                  </div>
                  <div class="insight-item" v-if="habits.length > 1">
                    <div class="insight-icon-small">📉</div>
                    <div class="insight-content">
                      <div class="insight-title">Needs Attention</div>
                      <div class="insight-value">{{ getNeedsAttentionHabit() }}</div>
                    </div>
                  </div>
                  <div class="insight-item" v-if="getBestDay()">
                    <div class="insight-icon-small">⭐</div>
                    <div class="insight-content">
                      <div class="insight-title">Best Day</div>
                      <div class="insight-value">{{ getBestDay() }}</div>
                    </div>
                  </div>
                  <div class="insight-item" v-if="getTotalCompletionsThisWeek() > 0">
                    <div class="insight-icon-small">💪</div>
                    <div class="insight-content">
                      <div class="insight-title">This Week</div>
                      <div class="insight-value">{{ getTotalCompletionsThisWeek() }} completions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
        <!-- Habits Tab -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'habits'" key="habits" class="habits-tab notion-habits">
            <div class="habits-header notion-header">
              <div>
                <h1 class="habits-page-title font-display">Your Habits</h1>
                <p class="habits-page-subtitle">Manage and track your daily habits</p>
              </div>
              <button 
                @click="showNewHabitForm = true" 
                class="notion-btn notion-btn-primary"
              >
                + New Habit
              </button>
            </div>
            
            <transition name="slide-up">
              <div v-if="showNewHabitForm || editingHabit" class="notion-card notion-form-card">
                <HabitForm 
                  :habit="editingHabit"
                  @submit="createHabit"
                  @cancel="showNewHabitForm = false; editingHabit = null"
                />
              </div>
            </transition>
            
            <div v-if="habits.length === 0 && !showNewHabitForm" class="notion-empty-state-large">
              <div class="empty-icon-large">📝</div>
              <h3 class="empty-title">No habits yet</h3>
              <p class="empty-description">Create your first habit to start tracking your progress</p>
              <button 
                @click="showNewHabitForm = true" 
                class="notion-btn notion-btn-primary"
              >
                Create Your First Habit
              </button>
            </div>
            
            <div v-else class="habits-grid notion-grid-habits">
              <HabitCard
                v-for="(habit, index) in habits"
                :key="habit.id"
                :habit="habit"
                :completions="completions"
                :class="`animate-stagger-${(index % 5) + 1}`"
                @edit="editHabit"
                @delete="deleteHabit"
                @toggle-completion="toggleHabitCompletion"
              />
            </div>
          </div>
        </transition>
        
        <!-- Habit Details Modal -->
        <div v-if="selectedHabitDetails" class="habit-details-modal">
          <div class="habit-details-content">
            <div class="habit-details-header">
              <h2>{{ selectedHabitDetails.name }}</h2>
              <button @click="closeHabitDetails" class="close-btn">×</button>
            </div>
            <div class="habit-details-body">
              <div class="habit-details-info">
                <p><strong>Description:</strong> {{ selectedHabitDetails.description || 'No description' }}</p>
                <p><strong>Frequency:</strong> {{ selectedHabitDetails.frequency }}</p>
                <p><strong>Reminder Time:</strong> {{ selectedHabitDetails.reminderTime || 'No reminder set' }}</p>
                <p><strong>Created:</strong> {{ formatDate(parseISO(selectedHabitDetails.createdAt), 'PPP') }}</p>
              </div>
              <div class="habit-details-stats">
                <div class="stat-item">
                  <span class="stat-label">Current Streak</span>
                  <span class="stat-value">{{ calculateStreak(selectedHabitDetails.id) }} days</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Completion Rate</span>
                  <span class="stat-value">{{ getHabitCompletionRate(selectedHabitDetails.id) }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Total Completions</span>
                  <span class="stat-value">{{ getTotalCompletions(selectedHabitDetails.id) }}</span>
                </div>
              </div>
              <div class="habit-details-actions">
                <button @click="editHabit(selectedHabitDetails)" class="btn btn-primary">Edit Habit</button>
                <button @click="closeHabitDetails" class="btn btn-outline">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday as isDateToday, parseISO } from 'date-fns'
import axios from 'axios'
import Navbar from '../components/Navbar.vue'
import HabitCard from '../components/HabitCard.vue'
import HabitForm from '../components/HabitForm.vue'
// Import Chart.js components
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import config from '../config.js'
import { useUserStore } from '../stores/user.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const MOTIVATIONAL_MESSAGES = [
  "Great job on maintaining your streak! Keep going!",
  "Consistency is key. You're building something amazing!",
  "Every completed habit brings you closer to your goals!",
  "Progress, not perfection. You're doing great!",
  "Small habits create big changes. Stay consistent!",
  "Your future self will thank you for today's efforts!",
  "You've completed 70% of your weekly goals! Amazing!",
  "Building habits is like building muscles - it takes time but gets stronger!",
  "Each day is a new opportunity to be better than yesterday!",
  "The secret to getting ahead is getting started!",
  "Success is the sum of small efforts repeated day in and day out!",
  "You're not just building habits, you're building character!",
  "Every expert was once a beginner. Keep going!",
  "The best time to plant a tree was 20 years ago. The second best time is now!",
  "Your habits shape your identity, and your identity shapes your habits!"
]

const COLORS = ['#000000', '#6c757d', '#495057', '#343a40', '#212529', '#adb5bd', '#dee2e6']

export default {
  name: 'Dashboard',
  components: {
    Navbar,
    HabitCard,
    HabitForm,
    Bar,
    Doughnut,
    Line
  },
  setup() {
    const userStore = useUserStore()
    const activeTab = ref('dashboard')
    const selectedDate = ref(new Date())
    const habits = ref([])
    const completions = ref([])
    const notifications = ref([])
    const showNewHabitForm = ref(false)
    const editingHabit = ref(null)
    const selectedHabitDetails = ref(null)
    const hoveredSegment = ref(null)
    
    // Computed properties
    const weekDays = computed(() => {
      const weekStart = startOfWeek(selectedDate.value)
      const weekEnd = endOfWeek(selectedDate.value)
      return eachDayOfInterval({ start: weekStart, end: weekEnd })
    })
    
    const maxStreak = computed(() => {
      return Math.max(...habits.value.map(habit => calculateStreak(habit.id)), 0)
    })
    
    const completionRate = computed(() => {
      const totalPossible = habits.value.reduce((total, habit) => {
        const habitCompletions = completions.value.filter(c => c.habitId === habit.id)
        return total + (habitCompletions.length > 0 ? 1 : 0)
      }, 0)
      
      const totalCompleted = habits.value.reduce((total, habit) => {
        const completed = completions.value.filter(c => 
          c.habitId === habit.id && c.completed
        ).length
        return total + (completed > 0 ? 1 : 0)
      }, 0)
      
      return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
    })
    
    const weeklyStats = computed(() => {
      return habits.value.map(habit => {
        const completedCount = weekDays.value.filter(day => {
          const completion = getHabitCompletion(habit.id, day)
          return completion?.completed
        }).length
        
        return {
          habit: habit.name,
          completed: completedCount,
          total: habit.frequency === 'daily' ? 7 : habit.schedule?.length || 7,
          color: habit.color
        }
      })
    })
    
    const monthlyProgress = computed(() => {
      const monthStart = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1)
      const monthEnd = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth() + 1, 0)
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
      
      return monthDays.map(day => {
        const completed = completions.value.filter(c => 
          c.completed && isSameDay(parseISO(c.date), day)
        ).length
        const totalHabits = habits.value.length
        const ratio = totalHabits > 0 ? completed / totalHabits : 0
        
        return {
          date: format(day, 'MMM dd'),
          completed,
          totalHabits,
          ratio,
          isToday: isSameDay(day, new Date())
        }
      })
    })
    
    const monthlyTrendPoints = computed(() => {
      const monthStart = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1)
      const monthEnd = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth() + 1, 0)
      const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
      
      const points = monthDays.map((day, index) => {
        const completed = completions.value.filter(c => 
          c.completed && isSameDay(parseISO(c.date), day)
        ).length
        
        const x = (index / (monthDays.length - 1)) * 300
        const y = 150 - (completed * 10) // Scale for visualization
        
        return `${x},${y}`
      }).join(' ')
      
      return points
    })
    
    // Chart.js data and options
    const weeklyChartData = computed(() => ({
      labels: weeklyStats.value.map(stat => stat.habit),
      datasets: [{
        label: 'Completed',
        data: weeklyStats.value.map(stat => stat.completed),
        backgroundColor: weeklyStats.value.map(stat => stat.color),
        borderColor: weeklyStats.value.map(stat => stat.color),
        borderWidth: 1
      }]
    }))
    
    const weeklyChartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: 10,
          titleFont: {
            size: 12,
            weight: '600',
            family: "'Space Grotesk', sans-serif"
          },
          bodyFont: {
            size: 11,
            family: "'Space Grotesk', sans-serif"
          },
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#6c757d',
            font: {
              size: 11,
              family: "'Space Grotesk', sans-serif"
            },
            padding: 8
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.04)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            stepSize: 1,
            color: '#6c757d',
            font: {
              size: 11,
              weight: '400',
              family: "'Space Grotesk', sans-serif"
            },
            padding: 8
          }
        }
      },
      elements: {
        bar: {
          borderRadius: 4,
          borderSkipped: false
        }
      }
    }))
    
    const habitDistributionData = computed(() => ({
      labels: habits.value.map(habit => habit.name),
      datasets: [{
        data: habits.value.map(habit => calculateStreak(habit.id)),
        backgroundColor: habits.value.map(habit => habit.color),
        borderColor: habits.value.map(habit => habit.color),
        borderWidth: 1
      }]
    }))
    
    const habitDistributionOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: 10,
          titleFont: {
            size: 12,
            weight: '600',
            family: "'Space Grotesk', sans-serif"
          },
          bodyFont: {
            size: 11,
            family: "'Space Grotesk', sans-serif"
          },
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true
        }
      },
      elements: {
        arc: {
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4
        }
      }
    }))
    
    const monthlyChartData = computed(() => ({
      labels: monthlyProgress.value.map(item => item.date),
      datasets: [{
        label: 'Completion Ratio',
        data: monthlyProgress.value.map(item => item.ratio),
        borderColor: '#000000',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: monthlyProgress.value.map(item => 
          item.isToday ? '#000000' : '#666666'
        ),
        pointBorderColor: monthlyProgress.value.map(item => 
          item.isToday ? '#000000' : '#666666'
        ),
        pointRadius: monthlyProgress.value.map(item => 
          item.isToday ? 6 : 3
        ),
        pointHoverRadius: 8
      }]
    }))
    
    const monthlyChartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 250,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 6,
          padding: 10,
          titleFont: {
            size: 12,
            weight: '600',
            family: "'Space Grotesk', sans-serif"
          },
          bodyFont: {
            size: 11,
            family: "'Space Grotesk', sans-serif"
          },
          displayColors: false,
          callbacks: {
            title: function(context) {
              return context[0].label
            },
            label: function(context) {
              const data = monthlyProgress.value[context.dataIndex]
              const completed = data.completed
              const total = data.totalHabits
              const ratio = (completed / total).toFixed(2)
              const percentage = Math.round(ratio * 100)
              let insight = ''
              
              if (ratio === '1.00') {
                insight = 'All habits completed'
              } else if (ratio >= '0.75') {
                insight = 'Most habits completed'
              } else if (ratio >= '0.50') {
                insight = 'Half habits completed'
              } else if (ratio > '0.00') {
                insight = 'Some habits completed'
              } else {
                insight = 'No habits completed'
              }
              
              return [
                `${completed}/${total} habits completed`,
                `${percentage}% completion rate`,
                insight
              ]
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#6c757d',
            font: {
              size: 11,
              family: "'Space Grotesk', sans-serif"
            },
            padding: 8
          }
        },
        y: {
          beginAtZero: true,
          max: 1,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.04)',
            lineWidth: 1,
            drawBorder: false
          },
          ticks: {
            stepSize: 0.25,
            color: '#6c757d',
            font: {
              size: 11,
              weight: '400',
              family: "'Space Grotesk', sans-serif"
            },
            padding: 8,
            callback: function(value) {
              return Math.round(value * 100) + '%'
            }
          }
        }
      },
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 2.5,
          borderColor: '#000000',
          fill: true,
          backgroundColor: 'rgba(0, 0, 0, 0.03)'
        },
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2,
          borderColor: '#ffffff',
          backgroundColor: '#000000',
          hoverBorderWidth: 3
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }))
    
    const weeklyDistributionData = computed(() => ({
      labels: weeklyStats.value.map(stat => stat.habit),
      datasets: [{
        data: weeklyStats.value.map(stat => stat.completed),
        backgroundColor: weeklyStats.value.map(stat => stat.color),
        borderColor: weeklyStats.value.map(stat => stat.color),
        borderWidth: 1
      }]
    }))
    
    const weeklyDistributionOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: 10,
          titleFont: {
            size: 12,
            weight: '600',
            family: "'Space Grotesk', sans-serif"
          },
          bodyFont: {
            size: 11,
            family: "'Space Grotesk', sans-serif"
          },
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          cornerRadius: 6,
          displayColors: true,
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = Math.round((context.parsed / total) * 100)
              return `${context.label}: ${percentage}%`
            }
          }
        }
      },
      onHover: (event, elements) => {
        if (elements.length > 0) {
          hoveredSegment.value = elements[0].index
        } else {
          hoveredSegment.value = null
        }
      },
      elements: {
        arc: {
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4
        }
      }
    }))
    
    // Methods
    const setActiveTab = (tab) => {
      activeTab.value = tab
    }
    
    const formatDate = (date, formatStr) => {
      return format(date, formatStr)
    }
    
    const isToday = (date) => {
      return isDateToday(date)
    }
    
    const getHabitCompletion = (habitId, date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return completions.value.find(c => c.habitId === habitId && c.date === dateStr)
    }
    
    const calculateStreak = (habitId) => {
      const habitCompletions = completions.value
        .filter(c => c.habitId === habitId && c.completed)
        .map(c => parseISO(c.date))
        .sort((a, b) => b.getTime() - a.getTime())
      
      if (habitCompletions.length === 0) return 0
      
      let streak = 1
      let currentDate = new Date(habitCompletions[0])
      
      for (let i = 1; i < habitCompletions.length; i++) {
        const prevDate = new Date(currentDate)
        prevDate.setDate(prevDate.getDate() - 1)
        
        if (isSameDay(prevDate, habitCompletions[i])) {
          streak++
          currentDate = habitCompletions[i]
        } else {
          break
        }
      }
      
      return streak
    }
    
    const getHabitCompletionRate = (habitId) => {
      const habitCompletions = completions.value.filter(c => c.habitId === habitId)
      const completedCount = habitCompletions.filter(c => c.completed).length
      return habitCompletions.length > 0 ? Math.round((completedCount / habitCompletions.length) * 100) : 0
    }
    
    const getPieRotation = (index) => {
      return (index * 360) / habits.value.length
    }
    
    const toggleHabitCompletion = async (habitId, date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const existing = completions.value.find(c => 
        c.habitId === habitId && c.date === dateStr
      )
      
      const habit = habits.value.find(h => h.id === habitId)
      const completed = existing ? !existing.completed : true
      
      try {
        await apiCall('post', '/api/completions', {
          habitId: parseInt(habitId),
          date: dateStr,
          completed
        })
        
        // Update local state
        if (existing) {
          existing.completed = completed
        } else {
          completions.value.push({
            id: Date.now().toString(),
            habitId,
            date: dateStr,
            completed: true
          })
        }
        
        if (completed) {
          addNotification(`Great job completing "${habit.name}"!`, 'success')
        }
        
        // Check for streak milestones
        const streak = calculateStreak(habitId)
        if (streak > 0 && streak % 7 === 0) {
          addNotification(`🎉 Amazing! You've maintained "${habit.name}" for ${streak} days straight!`, 'motivational')
        } else if (streak > 0 && streak % 30 === 0) {
          addNotification(`🏆 Incredible! "${habit.name}" streak: ${streak} days! You're unstoppable!`, 'motivational')
        }
      } catch (error) {
        console.warn('API call failed, updating local state only:', error)
        // Still update local state even if API fails
        if (existing) {
          existing.completed = completed
        } else {
          completions.value.push({
            id: Date.now().toString(),
            habitId,
            date: dateStr,
            completed: true
          })
        }
        
        if (completed) {
          addNotification(`Great job completing "${habit.name}"!`, 'success')
        }
      }
    }
    
    const createHabit = async (habitData) => {
      try {
        if (habitData.id) {
          // Update existing habit
          await apiCall('put', `/api/habits/${habitData.id}`, {
            name: habitData.name,
            description: habitData.description,
            frequency: habitData.frequency,
            color: habitData.color
          })
          
          // Update local state
          const index = habits.value.findIndex(h => h.id === habitData.id)
          if (index !== -1) {
            habits.value[index] = {
              ...habits.value[index],
              name: habitData.name,
              description: habitData.description,
              frequency: habitData.frequency,
              color: habitData.color
            }
          }
          addNotification(`Habit "${habitData.name}" updated successfully!`, 'success')
          editingHabit.value = null
        } else {
          // Try to create habit via API
          let habitId
          try {
            const response = await apiCall('post', '/api/habits', {
              name: habitData.name,
              description: habitData.description,
              frequency: habitData.frequency,
              color: habitData.color
            })
            habitId = response.data.id
          } catch (apiError) {
            console.warn('API call failed, falling back to localStorage:', apiError)
            // Fallback to localStorage if API fails
            habitId = Date.now().toString()
          }
          
          const habit = {
            id: habitId,
            name: habitData.name,
            description: habitData.description,
            frequency: habitData.frequency,
            color: habitData.color,
            created_at: new Date().toISOString()
          }
          
          habits.value.push(habit)
          showNewHabitForm.value = false
          
          // Add notification
          addNotification(`Habit "${habit.name}" created successfully!`, 'success')
        }
      } catch (error) {
        console.error('Error saving habit:', error)
        addNotification('Error saving habit. Please try again.', 'error')
      }
    }
    
    const editHabit = (habit) => {
      editingHabit.value = habit
    }
    
    const deleteHabit = async (habitId) => {
      try {
        await apiCall('delete', `/api/habits/${habitId}`)
        
        // Update local state
        habits.value = habits.value.filter(h => h.id !== habitId)
        completions.value = completions.value.filter(c => c.habitId !== habitId)
        
        addNotification('Habit deleted successfully!', 'success')
      } catch (error) {
        console.warn('API call failed, updating local state only:', error)
        // Still update local state even if API fails
        habits.value = habits.value.filter(h => h.id !== habitId)
        completions.value = completions.value.filter(c => c.habitId !== habitId)
        
        addNotification('Habit deleted successfully!', 'success')
      }
    }
    
    const addNotification = async (message, type = 'info') => {
      const notification = {
        id: Date.now().toString(),
        message,
        type,
        read: false,
        created_at: new Date().toISOString()
      }
      
      notifications.value.unshift(notification)
      
      // Try to save to backend, but don't fail if it doesn't work
      try {
        await apiCall('post', '/api/notifications', {
          message,
          type
        })
      } catch (error) {
        console.warn('Failed to save notification to backend:', error)
      }
      
      // Auto-remove notification after 10 seconds
      setTimeout(() => {
        const index = notifications.value.findIndex(n => n.id === notification.id)
        if (index !== -1) {
          notifications.value.splice(index, 1)
        }
      }, 10000)
    }
    
    const previousWeek = () => {
      selectedDate.value = addDays(selectedDate.value, -7)
    }
    
    const nextWeek = () => {
      selectedDate.value = addDays(selectedDate.value, 7)
    }
    
    const goToToday = () => {
      selectedDate.value = new Date()
    }
    
    const getGreeting = () => {
      const name = userStore.user?.name
      if (name) {
        return `Good morning, ${name}`
      } else {
        return 'Welcome back'
      }
    }
    
    const getUserName = () => {
      return userStore.user?.name || 'User'
    }
    
    const getMotivationalMessage = () => {
      const messages = [
        "Ready to build some amazing habits today?",
        "Every small step counts towards your goals!",
        "You're doing great! Keep up the momentum!",
        "Today is a perfect day to make progress!",
        "Your future self will thank you for today's efforts!"
      ]
      return messages[Math.floor(Math.random() * messages.length)]
    }
    
    const generateCompletionInsight = () => {
      if (monthlyProgress.value.length === 0) return ''
      
      const recentData = monthlyProgress.value.slice(-7) // Last 7 days
      const avgRatio = recentData.reduce((sum, day) => sum + day.ratio, 0) / recentData.length
      
      // Check for consistency patterns
      const consecutiveDays = recentData.filter(day => day.ratio > 0).length
      const perfectDays = recentData.filter(day => day.ratio === 1).length
      
      if (perfectDays >= 3) {
        return `You were consistent ${perfectDays} days in a row`
      } else if (consecutiveDays >= 5) {
        return `You maintained activity ${consecutiveDays} days in a row`
      } else if (avgRatio >= 0.8) {
        return `Strong completion rate this week`
      } else if (avgRatio >= 0.5) {
        return `Moderate completion rate this week`
      } else if (avgRatio > 0) {
        return `Building momentum with partial completions`
      } else {
        return `Starting fresh this week`
      }
    }
    
    const sortedHabitsByConsistency = computed(() => {
      return [...habits.value].sort((a, b) => {
        const rateA = getHabitCompletionRate(a.id)
        const rateB = getHabitCompletionRate(b.id)
        return rateA - rateB // Lowest first
      })
    })
    
    const getWeeklyCompletionPercentage = (habitId) => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
      
      const completedDays = weekDays.filter(day => {
        const completion = getHabitCompletion(habitId, day)
        return completion?.completed
      }).length
      
      return Math.round((completedDays / 7) * 100)
    }
    
    const getHabitInsight = (habitId) => {
      const weeklyPercentage = getWeeklyCompletionPercentage(habitId)
      const missedCount = Math.round((100 - weeklyPercentage) / (100/7))
      
      if (weeklyPercentage >= 80) {
        return 'Stable habit'
      } else if (weeklyPercentage >= 60) {
        return 'Good progress'
      } else if (weeklyPercentage >= 40) {
        return 'Needs attention'
      } else if (missedCount > 0) {
        return `Missed ${missedCount} times this week`
      } else {
        return 'Building momentum'
      }
    }
    
    const showHabitDetails = (habit) => {
      selectedHabitDetails.value = habit
    }
    
    const closeHabitDetails = () => {
      selectedHabitDetails.value = null
    }
    
    const getTotalCompletions = (habitId) => {
      return completions.value.filter(c => c.habitId === habitId && c.completed).length
    }
    
    const getWeeklyAverage = () => {
      if (habits.value.length === 0) return 0
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
      
      let totalPercentage = 0
      habits.value.forEach(habit => {
        const completedDays = weekDays.filter(day => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const completion = completions.value.find(c => c.habitId === habit.id && c.date === dateStr && c.completed)
          return !!completion
        }).length
        totalPercentage += (completedDays / weekDays.length) * 100
      })
      
      return Math.round(totalPercentage / habits.value.length)
    }
    
    const getMostConsistentHabit = () => {
      if (habits.value.length === 0) return 'N/A'
      const habit = sortedHabitsByConsistency.value[0]
      return habit ? habit.name : 'N/A'
    }
    
    const getNeedsAttentionHabit = () => {
      if (habits.value.length < 2) return 'N/A'
      const sorted = sortedHabitsByConsistency.value
      const lastHabit = sorted[sorted.length - 1]
      return lastHabit ? lastHabit.name : 'N/A'
    }
    
    const getBestDay = () => {
      if (completions.value.length === 0) return null
      
      const dayCounts = {}
      completions.value.forEach(c => {
        if (c.completed) {
          const date = parseISO(c.date)
          const dayName = format(date, 'EEEE')
          dayCounts[dayName] = (dayCounts[dayName] || 0) + 1
        }
      })
      
      if (Object.keys(dayCounts).length === 0) return null
      
      const bestDay = Object.keys(dayCounts).reduce((a, b) => 
        dayCounts[a] > dayCounts[b] ? a : b
      )
      
      return bestDay
    }
    
    const getTotalCompletionsThisWeek = () => {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 })
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })
      const weekDates = weekDays.map(day => format(day, 'yyyy-MM-dd'))
      
      return completions.value.filter(c => 
        weekDates.includes(c.date) && c.completed
      ).length
    }
    
    // API helper functions
    const getUserId = () => {
      return userStore.user?.id || null
    }
    
    const apiCall = async (method, url, data = null) => {
      const userId = getUserId()
      if (!userId) throw new Error('User not authenticated')
      
      const axiosConfig = {
        method,
        url: `${config.API_BASE_URL}${url}`,
        headers: {
          'user-id': userId,
          'Content-Type': 'application/json'
        }
      }
      
      if (data) axiosConfig.data = data
      
      return axios(axiosConfig)
    }
    
    const loadDataFromBackend = async () => {
      try {
        const [habitsRes, completionsRes, notificationsRes] = await Promise.all([
          apiCall('get', '/api/habits'),
          apiCall('get', '/api/completions'),
          apiCall('get', '/api/notifications')
        ])
        
        habits.value = habitsRes.data
        completions.value = completionsRes.data.map(c => ({
          ...c,
          habitId: c.habit_id,
          completed: Boolean(c.completed)
        }))
        notifications.value = notificationsRes.data.map(n => ({
          ...n,
          read: Boolean(n.read)
        }))
        
        // Add initial notification if none exist
        if (notifications.value.length === 0) {
          await addNotification("Welcome to your habit tracker! Let's build some great habits together!", 'info')
        }
      } catch (error) {
        console.error('Error loading data from backend, falling back to localStorage:', error)
        // Fallback to localStorage if backend fails
        const savedHabits = localStorage.getItem('habits')
        const savedCompletions = localStorage.getItem('completions')
        const savedNotifications = localStorage.getItem('notifications')
        
        if (savedHabits) habits.value = JSON.parse(savedHabits)
        if (savedCompletions) completions.value = JSON.parse(savedCompletions)
        if (savedNotifications) notifications.value = JSON.parse(savedNotifications)
      }
    }
    
    // Load data from backend
    onMounted(async () => {
      // Check if user is authenticated
      const user = localStorage.getItem('user')
      if (!user) {
        console.log('No user found, redirecting to login')
        // Redirect to login if no user
        window.location.href = '/'
        return
      }
      
      console.log('Dashboard mounted, user:', JSON.parse(user))
      
      await loadDataFromBackend()
      
      // Add motivational notifications periodically
      setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance every 5 minutes
          addNotification(
            MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
            'motivational'
          )
        }
      }, 300000) // Every 5 minutes
      
      // Add daily progress notifications
      setInterval(() => {
        const totalHabits = habits.value.length
        const completedToday = completions.value.filter(c => 
          c.completed && isSameDay(parseISO(c.date), new Date())
        ).length
        
        if (totalHabits > 0) {
          const completionRate = (completedToday / totalHabits) * 100
          if (completionRate >= 80) {
            addNotification(`🎯 Outstanding! You completed ${completionRate.toFixed(0)}% of your habits today!`, 'motivational')
          } else if (completionRate >= 50) {
            addNotification(`👍 Good progress! You're ${completionRate.toFixed(0)}% complete today!`, 'info')
          }
        }
      }, 60000) // Check every minute
    })
    
    // Data is saved to backend immediately, no need for watch
    
    return {
      activeTab,
      selectedDate,
      habits,
      completions,
      notifications,
      showNewHabitForm,
      editingHabit,
      weekDays,
      maxStreak,
      completionRate,
      weeklyStats,
      monthlyProgress,
      monthlyTrendPoints,
      colors: COLORS,
      weeklyChartData,
      weeklyChartOptions,
      habitDistributionData,
      habitDistributionOptions,
      monthlyChartData,
      monthlyChartOptions,
      weeklyDistributionData,
      weeklyDistributionOptions,
      setActiveTab,
      formatDate,
      isToday,
      getHabitCompletion,
      calculateStreak,
      getHabitCompletionRate,
      getPieRotation,
      toggleHabitCompletion,
      createHabit,
      editHabit,
      deleteHabit,
      previousWeek,
      nextWeek,
      goToToday,
      getGreeting,
      getUserName,
      getMotivationalMessage,
      generateCompletionInsight,
      sortedHabitsByConsistency,
      getWeeklyCompletionPercentage,
      getHabitInsight,
      hoveredSegment,
      selectedHabitDetails,
      showHabitDetails,
      closeHabitDetails,
      getTotalCompletions,
      getWeeklyAverage,
      getMostConsistentHabit,
      getNeedsAttentionHabit,
      getBestDay,
      getTotalCompletionsThisWeek
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
}

.dashboard-content {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

// Dashboard Greetings
.dashboard-greetings {
  /* removed the 'tile' so the greeting sits directly on the page */
  background: transparent;
  backdrop-filter: none;
  border: none;
  border-radius: 0;
  padding: 0.5rem 0;
  margin-bottom: 2rem;
  box-shadow: none;
  text-align: left;
}

/* Greeting enter animation */
.greeting-fade-enter-active {
  /* You can change --greeting-delay to delay the whole greeting animation */
  --greeting-delay: 0.30s;
  transition: opacity .45s cubic-bezier(.2,.8,.2,1), transform .45s cubic-bezier(.2,.8,.2,1);
  transition-delay: var(--greeting-delay);
}
.greeting-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.greeting-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger title and subtitle for a nicer effect */
.greeting-fade-enter-from .greetings-title,
.greeting-fade-enter-from .greetings-subtitle {
  opacity: 0;
  transform: translateY(6px);
}
.greeting-fade-enter-active .greetings-title {
  transition: opacity .45s cubic-bezier(.2,.8,.2,1), transform .45s cubic-bezier(.2,.8,.2,1);
  transition-delay: calc(var(--greeting-delay) + 0s);
}
.greeting-fade-enter-active .greetings-subtitle {
  transition: opacity .45s cubic-bezier(.2,.8,.2,1), transform .45s cubic-bezier(.2,.8,.2,1);
  transition-delay: calc(var(--greeting-delay) + 0.12s);
}
.greeting-fade-enter-to .greetings-title,
.greeting-fade-enter-to .greetings-subtitle {
  opacity: 1;
  transform: translateY(0);
}

.greetings-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: $primary-black;
  margin-bottom: 0.5rem;
}

.greetings-subtitle {
  font-size: 1.1rem;
  color: $gray-600;
  font-style: italic;
}

// Stats Grid
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 1rem;
  font-weight: 600;
  color: $gray-600;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: $primary-black;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.02em;
}

.test-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  h3 {
    color: $primary-black;
    margin-bottom: 1rem;
  }
  
  p {
    color: $gray-600;
    margin-bottom: 0.5rem;
  }
}

// Charts
.chart-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $primary-black;
  margin-bottom: 1.5rem;
}

.chart-container {
  height: 300px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  color: $gray-500;
  font-style: italic;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 100%;
  width: 100%;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-fill {
  width: 100%;
  min-height: 20px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 0.75rem;
  color: $gray-600;
  margin-top: 0.5rem;
  text-align: center;
  word-break: break-word;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

// Pie Chart
.pie-chart {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pie-placeholder {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
}

.pie-segments {
  width: 100%;
  height: 100%;
  position: relative;
}

.pie-segment {
  position: absolute;
  width: 50%;
  height: 50%;
  transform-origin: 100% 100%;
  border-radius: 0 0 0 100%;
}

// Line Chart
.line-chart {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-placeholder {
  width: 100%;
  height: 100%;
}

.line-svg {
  width: 100%;
  height: 100%;
}

// Calendar
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.calendar-title {
  font-size: 2rem;
  font-weight: 600;
  color: $primary-black;
}

.calendar-controls {
  display: flex;
  gap: 0.5rem;
}

.calendar-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
}

.calendar-header-row {
  display: contents;
}

.calendar-day-header {
  text-align: center;
  font-weight: 600;
  color: $primary-black;
  padding: 0.5rem;
}

.calendar-body {
  display: contents;
}

.calendar-day {
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  min-height: 120px;
  
  &.calendar-day-today {
    border-color: $primary-black;
    background: rgba(0, 0, 0, 0.05);
  }
}

.calendar-day-number {
  text-align: center;
  margin-bottom: 0.5rem;
  
  .today-highlight {
    color: $primary-black;
    font-weight: 700;
  }
}

.calendar-habits {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.habit-button {
  width: 100%;
  padding: 0.25rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.05);
  color: $gray-600;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
  
  &.habit-completed {
    background: $gray-200;
    color: $primary-black;
  }
}

// Analytics - Notion-inspired styles
.analytics-tab {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.analytics-header {
  margin-bottom: 2.5rem;
  
  .analytics-page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: $primary-black;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }
  
  .analytics-page-subtitle {
    font-size: 1rem;
    color: $gray-600;
    font-weight: 400;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: $primary-white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 1.25rem;
  transition: all 0.2s ease;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  
  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .metric-icon {
    font-size: 1.5rem;
    line-height: 1;
    flex-shrink: 0;
  }
  
  .metric-content {
    flex: 1;
    min-width: 0;
  }
  
  .metric-label {
    font-size: 0.8125rem;
    color: $gray-600;
    font-weight: 500;
    margin-bottom: 0.375rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  
  .metric-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: $primary-black;
    line-height: 1.2;
    margin-bottom: 0.25rem;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.02em;
  }
  
  .metric-change {
    font-size: 0.8125rem;
    color: $gray-500;
    font-weight: 400;
    
    &.positive {
      color: #22c55e;
    }
    
    &.negative {
      color: #ef4444;
    }
    
    &.neutral {
      color: $gray-600;
    }
  }
}

.notion-card {
  background: $primary-white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.notion-chart-card {
  margin-bottom: 1.5rem;
  
  .notion-card-header {
    padding: 1.5rem 1.5rem 0.75rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }
  
  .notion-card-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: $primary-black;
    margin-bottom: 0.25rem;
    letter-spacing: -0.01em;
  }
  
  .notion-card-subtitle {
    font-size: 0.8125rem;
    color: $gray-600;
    font-weight: 400;
    margin: 0;
  }
  
  .notion-card-content {
    padding: 1.5rem;
  }
}

.notion-chart {
  margin: 0;
}

.notion-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
  min-height: 200px;
  
  .placeholder-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  p {
    color: $gray-600;
    font-size: 0.9375rem;
    margin: 0.25rem 0;
  }
  
  .placeholder-hint {
    font-size: 0.8125rem;
    color: $gray-500;
    margin-top: 0.5rem;
  }
}

.notion-insight-box {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  border-left: 3px solid $primary-black;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  
  .insight-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }
  
  .insight-text {
    font-size: 0.875rem;
    color: $gray-700;
    line-height: 1.5;
    margin: 0;
    font-style: normal;
  }
}

.notion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.notion-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notion-list-item {
  padding: 0.875rem;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(0, 0, 0, 0.01);
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  
  &:hover {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(0, 0, 0, 0.1);
    transform: translateX(2px);
  }
  
  .performance-rank {
    font-size: 0.75rem;
    font-weight: 600;
    color: $gray-500;
    min-width: 1.5rem;
    padding-top: 0.125rem;
  }
  
  .performance-content {
    flex: 1;
    min-width: 0;
  }
  
  .performance-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    gap: 0.75rem;
  }
  
  .performance-name {
    font-weight: 500;
    color: $primary-black;
    font-size: 0.9375rem;
    flex: 1;
    min-width: 0;
  }
  
  .performance-percentage {
    font-size: 0.8125rem;
    font-weight: 600;
    color: $gray-700;
    flex-shrink: 0;
  }
  
  .notion-bar {
    height: 4px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.5rem;
  }
  
  .notion-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s ease;
  }
  
  .performance-insight {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.25rem;
  }
  
  .insight-text {
    font-size: 0.75rem;
    color: $gray-600;
    font-style: normal;
  }
}

.notion-empty-state {
  padding: 2rem;
  text-align: center;
  
  .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }
  
  p {
    color: $gray-600;
    font-size: 0.875rem;
    margin: 0;
  }
}

.notion-legend {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notion-legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.15s ease;
  
  &.legend-item-highlighted {
    background: rgba(0, 0, 0, 0.04);
  }
  
  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
  }
  
  .legend-name {
    flex: 1;
    font-size: 0.8125rem;
    color: $primary-black;
    font-weight: 400;
  }
  
  .legend-percentage {
    font-size: 0.8125rem;
    color: $gray-600;
    font-weight: 500;
  }
}

.notion-insights-card {
  margin-top: 1.5rem;
  
  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .insight-item {
    padding: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.01);
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    transition: all 0.15s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.02);
      border-color: rgba(0, 0, 0, 0.1);
    }
    
    .insight-icon-small {
      font-size: 1.25rem;
      flex-shrink: 0;
      line-height: 1;
    }
    
    .insight-content {
      flex: 1;
      min-width: 0;
    }
    
    .insight-title {
      font-size: 0.75rem;
      color: $gray-600;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      margin-bottom: 0.25rem;
    }
    
    .insight-value {
      font-size: 0.9375rem;
      color: $primary-black;
      font-weight: 600;
      line-height: 1.3;
    }
  }
}

// Enhanced chart styling for Notion look
.notion-chart-card {
  .chart-placeholder {
    background: transparent;
    border: none;
  }
}

// Analytics Grid (keep for backward compatibility)
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.chart-header {
  margin-bottom: 1rem;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: $gray-500;
  margin-top: 0.25rem;
  font-weight: normal;
}

.insight-strip {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
  border-left: 3px solid $primary-black;
}

.insight-text {
  font-size: 0.875rem;
  color: $gray-600;
  font-style: italic;
}

.performance-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.performance-item {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.performance-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.performance-name {
  font-weight: 500;
  color: $primary-black;
  flex: 1;
}

.performance-bar-container {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.performance-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s ease;
}

.performance-percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: $gray-600;
  min-width: 3rem;
  text-align: right;
}

.performance-insight {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: $gray-500;
}

.view-history {
  color: $primary-black;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  .performance-item:hover & {
    opacity: 1;
  }
}

.donut-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.donut-center-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.center-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: $gray-600;
}

.donut-legend {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
  
  &.legend-item-highlighted {
    background: rgba(0, 0, 0, 0.05);
  }
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  flex: 1;
  font-size: 0.875rem;
  color: $gray-700;
}

.legend-percentage {
  font-size: 0.875rem;
  font-weight: 500;
  color: $gray-600;
}

.chart-helper-text {
  margin-top: 1rem;
  text-align: center;
}

.chart-helper-text p {
  font-size: 0.75rem;
  color: $gray-500;
  font-style: italic;
}

// Micro-interactions
.analytics-tab {
  animation: fadeInUp 0.6s ease-out;
}

.chart-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
}

// Habits
.habits-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.habits-title {
  font-size: 2rem;
  font-weight: 600;
  color: $primary-black;
}

.habits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

// Responsive
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .calendar-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .calendar-controls {
    justify-content: center;
  }
  
  .habits-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .habits-grid {
    grid-template-columns: 1fr;
  }
}

// Habit Details Modal
.habit-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.habit-details-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.habit-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  
  h2 {
    color: $primary-black;
    margin: 0;
  }
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: $gray-500;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: $primary-black;
  }
}

.habit-details-body {
  padding: 1.5rem;
}

.habit-details-info {
  margin-bottom: 1.5rem;
  
  p {
    margin-bottom: 0.75rem;
    color: $gray-600;
    
    strong {
      color: $primary-black;
    }
  }
}

.habit-details-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: $gray-500;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-weight: 600;
  color: $primary-black;
  font-size: 1.25rem;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
}

.habit-details-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

// Notion-inspired Styles for Dashboard Tab
.notion-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.dashboard-header {
  margin-bottom: 2.5rem;
  
  .dashboard-page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: $primary-black;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }
  
  .dashboard-page-subtitle {
    font-size: 1rem;
    color: $gray-600;
    font-weight: 400;
  }
}

.notion-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.notion-stat-card {
  background: $primary-white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 1.25rem;
  transition: all 0.2s ease;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  
  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .stat-icon {
    font-size: 1.5rem;
    line-height: 1;
    flex-shrink: 0;
  }
  
  .stat-content {
    flex: 1;
    min-width: 0;
  }
  
  .stat-label {
    font-size: 0.8125rem;
    color: $gray-600;
    font-weight: 500;
    margin-bottom: 0.375rem;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  
  .stat-value-large {
    font-size: 1.75rem;
    font-weight: 700;
    color: $primary-black;
    line-height: 1.2;
    margin-bottom: 0.25rem;
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.02em;
  }
  
  .stat-hint {
    font-size: 0.8125rem;
    color: $gray-500;
    font-weight: 400;
    
    &.positive {
      color: #22c55e;
    }
    
    &.negative {
      color: #ef4444;
    }
    
    &.neutral {
      color: $gray-600;
    }
  }
}

// Notion-inspired Calendar Styles
.notion-calendar {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.notion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
  
  .calendar-page-title,
  .habits-page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: $primary-black;
    margin-bottom: 0.5rem;
    letter-spacing: -0.02em;
  }
  
  .calendar-page-subtitle,
  .habits-page-subtitle {
    font-size: 1rem;
    color: $gray-600;
    font-weight: 400;
  }
}

.notion-controls {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.notion-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: $primary-white;
  color: $primary-black;
  font-family: $font-primary;
  
  &:hover {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.12);
  }
  
  &.notion-btn-primary {
    background: $primary-black;
    color: $primary-white;
    border-color: $primary-black;
    
    &:hover {
      background: $gray-800;
      border-color: $gray-800;
    }
  }
  
  &.notion-btn-outline {
    background: transparent;
    border-color: rgba(0, 0, 0, 0.12);
    
    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }
  
  &.notion-btn-lg {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

.notion-calendar-card {
  margin-top: 1.5rem;
}

.notion-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
  background: $primary-white;
}

.notion-calendar-header-row {
  display: contents;
}

.notion-calendar-day-header {
  background: rgba(0, 0, 0, 0.02);
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.8125rem;
  color: $gray-600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.notion-calendar-body {
  display: contents;
}

.notion-calendar-day {
  padding: 1rem;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: $primary-white;
  min-height: 140px;
  transition: background 0.15s ease;
  
  &:last-child {
    border-right: none;
  }
  
  &.notion-calendar-day-today {
    background: rgba(0, 0, 0, 0.02);
    border-left: 3px solid $primary-black;
  }
  
  &:hover {
    background: rgba(0, 0, 0, 0.01);
  }
}

.notion-calendar-day-number {
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  color: $gray-700;
  
  .notion-today-highlight {
    color: $primary-black;
    font-weight: 700;
    font-size: 1rem;
  }
}

.notion-calendar-habits {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.notion-habit-button {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8125rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  background: rgba(0, 0, 0, 0.03);
  color: $gray-700;
  border-left: 3px solid transparent;
  
  &:hover {
    background: rgba(0, 0, 0, 0.06);
    transform: translateX(2px);
  }
  
  &.notion-habit-completed {
    background: rgba(0, 0, 0, 0.08);
    color: $primary-black;
    font-weight: 500;
    text-decoration: line-through;
    opacity: 0.7;
  }
}

// Notion-inspired Habits Tab Styles
.notion-habits {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.notion-form-card {
  margin-bottom: 2rem;
}

.notion-grid-habits {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.notion-empty-state-large {
  text-align: center;
  padding: 4rem 2rem;
  background: $primary-white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  
  .empty-icon-large {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.4;
  }
  
  .empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: $primary-black;
    margin-bottom: 0.5rem;
  }
  
  .empty-description {
    font-size: 1rem;
    color: $gray-600;
    margin-bottom: 1.5rem;
  }
}

// Enhanced Chart Options for cleaner look
.chart-container.notion-chart {
  padding: 0;
}
</style>

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
        <transition name="fade" mode="out-in" delay="20000">
          <div v-if="activeTab === 'dashboard'" key="dashboard" class="dashboard-tab">
            <!-- Dashboard Greetings -->
            <transition name="greeting-fade" appear delay="2000">
              <div class="dashboard-greetings glass">
                <h1 class="greetings-title font-display">
                  {{ getGreeting() }}, {{ getUserName() }}! 👋
                </h1>
                <p class="greetings-subtitle">
                  {{ getMotivationalMessage() }}
                </p>
              </div>
            </transition>
            
            <div class="stats-grid">
              <div class="stat-card glass">
                <h3 class="stat-title">Total Habits</h3>
                <p class="stat-value">{{ habits.length }}</p>
              </div>
              <div class="stat-card glass">
                <h3 class="stat-title">Current Streak</h3>
                <p class="stat-value">{{ maxStreak }}</p>
              </div>
              <div class="stat-card glass">
                <h3 class="stat-title">Completion Rate</h3>
                <p class="stat-value">{{ completionRate }}%</p>
              </div>
            </div>
            <div class="chart-card glass">
              <h3 class="chart-title">Weekly Progress</h3>
              <div class="chart-container">
                <div v-if="weeklyStats.length === 0" class="chart-placeholder">
                  <p>No data available</p>
                </div>
                <div v-else>
                  <Bar 
                    :data="weeklyChartData" 
                    :options="weeklyChartOptions"
                    style="height: 300px;"
                  />
                </div>
              </div>
            </div>
            
            <div class="charts-grid">
              <div class="chart-card glass">
                <h3 class="chart-title">Habit Distribution</h3>
                <div class="pie-chart">
                  <div v-if="habits.length === 0" class="chart-placeholder">
                    <p>No habits created yet</p>
                  </div>
                  <div v-else>
                    <Doughnut 
                      :data="habitDistributionData" 
                      :options="habitDistributionOptions"
                      style="height: 250px;"
                    />
                  </div>
                </div>
              </div>
              
              <div class="chart-card glass">
                <h3 class="chart-title">Monthly Trend</h3>
                <div class="line-chart">
                  <div v-if="monthlyProgress.length === 0" class="chart-placeholder">
                    <p>No progress data available</p>
                  </div>
                  <div v-else>
                    <Line 
                      :data="monthlyChartData" 
                      :options="monthlyChartOptions"
                      style="height: 250px;"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
        <!-- Calendar Tab -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'calendar'" key="calendar" class="calendar-tab">
            <!-- Debug info -->
            
            <div class="calendar-header">
              <h2 class="calendar-title font-display">
                {{ formatDate(selectedDate, 'MMMM yyyy') }}
              </h2>
              <div class="calendar-controls">
                <button @click="previousWeek" class="btn btn-outline btn-sm">
                  Previous Week
                </button>
                <button @click="goToToday" class="btn btn-primary btn-sm">
                  Today
                </button>
                <button @click="nextWeek" class="btn btn-outline btn-sm">
                  Next Week
                </button>
              </div>
            </div>
            
            <div class="calendar-card glass">
              <div class="calendar-grid">
                <div class="calendar-header-row">
                  <div 
                    v-for="day in weekDays" 
                    :key="day.toISOString()" 
                    class="calendar-day-header"
                  >
                    {{ formatDate(day, 'EEE') }}
                  </div>
                </div>
                
                <div class="calendar-body">
                  <div 
                    v-for="day in weekDays" 
                    :key="day.toISOString()"
                    :class="[
                      'calendar-day',
                      { 'calendar-day-today': isToday(day) }
                    ]"
                  >
                    <div class="calendar-day-number">
                      <span :class="{ 'today-highlight': isToday(day) }">
                        {{ formatDate(day, 'd') }}
                      </span>
                    </div>
                    
                    <div class="calendar-habits">
                      <button
                        v-for="habit in habits"
                        :key="habit.id"
                        @click="toggleHabitCompletion(habit.id, day)"
                        :class="[
                          'habit-button',
                          { 'habit-completed': getHabitCompletion(habit.id, day)?.completed }
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
          <div v-if="activeTab === 'analytics'" key="analytics" class="analytics-tab">
            <div class="chart-card glass">
              <h3 class="chart-title">Completion Trends</h3>
              <div class="line-chart">
                <div v-if="monthlyProgress.length === 0" class="chart-placeholder">
                  <p>No progress data available</p>
                </div>
                <div v-else>
                  <Line 
                    :data="monthlyChartData" 
                    :options="monthlyChartOptions"
                    style="height: 300px;"
                  />
                </div>
              </div>
            </div>
            
            <div class="analytics-grid">
              <div class="chart-card glass">
                <h3 class="chart-title">Habit Performance</h3>
                <div class="performance-list">
                  <div 
                    v-for="habit in habits" 
                    :key="habit.id"
                    class="performance-item"
                    @click="showHabitDetails(habit)"
                  >
                    <span class="performance-name">{{ habit.name }}</span>
                    <div class="performance-stats">
                      <span class="performance-streak">{{ calculateStreak(habit.id) }} days streak</span>
                      <span class="performance-rate">{{ getHabitCompletionRate(habit.id) }}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="chart-card glass">
                <h3 class="chart-title">Weekly Distribution</h3>
                <div class="pie-chart">
                  <div v-if="weeklyStats.length === 0" class="chart-placeholder">
                    <p>No weekly data available</p>
                  </div>
                  <div v-else>
                    <Doughnut 
                      :data="weeklyDistributionData" 
                      :options="weeklyDistributionOptions"
                      style="height: 250px;"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
        <!-- Habits Tab -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'habits'" key="habits" class="habits-tab">
            <div class="habits-header">
              <h2 class="habits-title font-display">Your Habits</h2>
              <button 
                @click="showNewHabitForm = true" 
                class="btn btn-primary"
              >
                + New Habit
              </button>
            </div>
            
            <transition name="slide-up">
              <HabitForm 
                v-if="showNewHabitForm || editingHabit"
                :habit="editingHabit"
                @submit="createHabit"
                @cancel="showNewHabitForm = false; editingHabit = null"
              />
            </transition>
            
            <div class="habits-grid">
              <HabitCard
                v-for="habit in habits"
                :key="habit.id"
                :habit="habit"
                :completions="completions"
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
    const activeTab = ref('dashboard')
    const selectedDate = ref(new Date())
    const habits = ref([])
    const completions = ref([])
    const notifications = ref([])
    const showNewHabitForm = ref(false)
    const editingHabit = ref(null)
    const selectedHabitDetails = ref(null)
    
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
      
      return monthDays.map(day => ({
        date: format(day, 'MMM dd'),
        completed: completions.value.filter(c => 
          c.completed && isSameDay(parseISO(c.date), day)
        ).length
      }))
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
        }
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 1
          },
          ticks: {
            color: '#666'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 1
          },
          ticks: {
            stepSize: 1,
            color: '#666'
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
        backgroundColor: habits.value.map((habit, index) => COLORS[index % COLORS.length]),
        borderColor: habits.value.map((habit, index) => COLORS[index % COLORS.length]),
        borderWidth: 1
      }]
    }))
    
    const habitDistributionOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }))
    
    const monthlyChartData = computed(() => ({
      labels: monthlyProgress.value.map(item => item.date),
      datasets: [{
        label: 'Completed',
        data: monthlyProgress.value.map(item => item.completed),
        borderColor: '#000000',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        tension: 0.4,
        fill: true
      }]
    }))
    
    const monthlyChartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 1
          },
          ticks: {
            color: '#666'
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)',
            lineWidth: 1
          },
          ticks: {
            stepSize: 1,
            color: '#666'
          }
        }
      },
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 3
        },
        point: {
          radius: 4,
          hoverRadius: 6
        }
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
      plugins: {
        legend: {
          position: 'bottom'
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
      const hour = new Date().getHours()
      if (hour < 12) return 'Good Morning'
      if (hour < 17) return 'Good Afternoon'
      return 'Good Evening'
    }
    
    const getUserName = () => {
      const user = localStorage.getItem('user')
      if (user) {
        try {
          const userData = JSON.parse(user)
          return userData.name || 'User'
        } catch {
          return 'User'
        }
      }
      return 'User'
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
    
    const showHabitDetails = (habit) => {
      selectedHabitDetails.value = habit
    }
    
    const closeHabitDetails = () => {
      selectedHabitDetails.value = null
    }
    
    const getTotalCompletions = (habitId) => {
      return completions.value.filter(c => c.habitId === habitId && c.completed).length
    }
    
    // API helper functions
    const getUserId = () => {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user).id : null
    }
    
    const apiCall = async (method, url, data = null) => {
      const userId = getUserId()
      if (!userId) throw new Error('User not authenticated')
      
      const config = {
        method,
        url: `http://localhost:3000${url}`,
        headers: {
          'user-id': userId,
          'Content-Type': 'application/json'
        }
      }
      
      if (data) config.data = data
      
      return axios(config)
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
      selectedHabitDetails,
      showHabitDetails,
      closeHabitDetails,
      getTotalCompletions
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/main.scss';

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
  padding: 0 2rem;
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
  font-family: $font-display;
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

// Analytics
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.performance-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: translateX(4px);
  }
}

.performance-name {
  font-weight: 500;
  color: $primary-black;
}

.performance-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.75rem;
  color: $gray-500;
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
}

.habit-details-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>

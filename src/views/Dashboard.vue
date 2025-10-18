<template>
  <div class="dashboard">
    <div class="grain-overlay"></div>
    
    <Navbar 
      :active-tab="activeTab" 
      @tab-change="setActiveTab"
    />
    
    <div class="dashboard-content">
      <div class="container">
        <!-- Dashboard Tab -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'dashboard'" key="dashboard" class="dashboard-tab">
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
                <div class="chart-placeholder">
                  <div class="chart-bars">
                    <div 
                      v-for="(stat, index) in weeklyStats" 
                      :key="index"
                      class="chart-bar"
                    >
                      <div 
                        class="bar-fill"
                        :style="{ 
                          height: `${(stat.completed / stat.total) * 100}%`,
                          backgroundColor: stat.color
                        }"
                      ></div>
                      <span class="bar-label">{{ stat.habit }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="charts-grid">
              <div class="chart-card glass">
                <h3 class="chart-title">Habit Distribution</h3>
                <div class="pie-chart">
                  <div class="pie-placeholder">
                    <div class="pie-segments">
                      <div 
                        v-for="(habit, index) in habits" 
                        :key="habit.id"
                        class="pie-segment"
                        :style="{ 
                          backgroundColor: colors[index % colors.length],
                          transform: `rotate(${getPieRotation(index)}deg)`
                        }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="chart-card glass">
                <h3 class="chart-title">Monthly Trend</h3>
                <div class="line-chart">
                  <div class="line-placeholder">
                    <svg viewBox="0 0 300 150" class="line-svg">
                      <polyline
                        :points="monthlyTrendPoints"
                        fill="none"
                        stroke="#000000"
                        stroke-width="2"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
        
        <!-- Calendar Tab -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'calendar'" key="calendar" class="calendar-tab">
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
                <div class="line-placeholder">
                  <svg viewBox="0 0 300 150" class="line-svg">
                    <polyline
                      :points="monthlyTrendPoints"
                      fill="none"
                      stroke="#000000"
                      stroke-width="2"
                    />
                  </svg>
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
                  <div class="pie-placeholder">
                    <div class="pie-segments">
                      <div 
                        v-for="(stat, index) in weeklyStats" 
                        :key="index"
                        class="pie-segment"
                        :style="{ 
                          backgroundColor: stat.color,
                          transform: `rotate(${getPieRotation(index)}deg)`
                        }"
                      ></div>
                    </div>
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
                v-if="showNewHabitForm"
                @submit="createHabit"
                @cancel="showNewHabitForm = false"
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
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, parseISO } from 'date-fns'
import Navbar from '../components/Navbar.vue'
import HabitCard from '../components/HabitCard.vue'
import HabitForm from '../components/HabitForm.vue'

const MOTIVATIONAL_MESSAGES = [
  "Great job on maintaining your streak! Keep going!",
  "Consistency is key. You're building something amazing!",
  "Every completed habit brings you closer to your goals!",
  "Progress, not perfection. You're doing great!",
  "Small habits create big changes. Stay consistent!",
  "Your future self will thank you for today's efforts!",
  "You've completed 70% of your weekly goals! Amazing!"
]

const COLORS = ['#000000', '#6c757d', '#495057', '#343a40', '#212529', '#adb5bd', '#dee2e6']

export default {
  name: 'Dashboard',
  components: {
    Navbar,
    HabitCard,
    HabitForm
  },
  setup() {
    const activeTab = ref('dashboard')
    const selectedDate = ref(new Date())
    const habits = ref([])
    const completions = ref([])
    const notifications = ref([])
    const showNewHabitForm = ref(false)
    
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
    
    // Methods
    const setActiveTab = (tab) => {
      activeTab.value = tab
    }
    
    const formatDate = (date, formatStr) => {
      return format(date, formatStr)
    }
    
    const isToday = (date) => {
      return isToday(date)
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
    
    const toggleHabitCompletion = (habitId, date) => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const existing = completions.value.find(c => 
        c.habitId === habitId && c.date === dateStr
      )
      
      if (existing) {
        existing.completed = !existing.completed
      } else {
        completions.value.push({
          id: Date.now().toString(),
          habitId,
          date: dateStr,
          completed: true
        })
      }
      
      // Save to localStorage
      localStorage.setItem('completions', JSON.stringify(completions.value))
    }
    
    const createHabit = (habitData) => {
      const habit = {
        id: Date.now().toString(),
        name: habitData.name,
        description: habitData.description,
        frequency: habitData.frequency,
        schedule: habitData.schedule || [],
        reminderTime: habitData.reminderTime,
        color: habitData.color,
        createdAt: new Date().toISOString(),
        targetDays: habitData.frequency === 'daily' ? 7 : habitData.targetDays
      }
      
      habits.value.push(habit)
      showNewHabitForm.value = false
      
      // Save to localStorage
      localStorage.setItem('habits', JSON.stringify(habits.value))
      
      // Add notification
      addNotification(`Habit "${habit.name}" created successfully!`, 'success')
    }
    
    const editHabit = (habit) => {
      // Implementation for editing habits
      console.log('Edit habit:', habit)
    }
    
    const deleteHabit = (habitId) => {
      habits.value = habits.value.filter(h => h.id !== habitId)
      completions.value = completions.value.filter(c => c.habitId !== habitId)
      
      // Save to localStorage
      localStorage.setItem('habits', JSON.stringify(habits.value))
      localStorage.setItem('completions', JSON.stringify(completions.value))
    }
    
    const addNotification = (message, type = 'info') => {
      notifications.value.unshift({
        id: Date.now().toString(),
        message,
        type,
        read: false,
        timestamp: new Date().toISOString()
      })
      
      // Save to localStorage
      localStorage.setItem('notifications', JSON.stringify(notifications.value))
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
    
    // Load data from localStorage
    onMounted(() => {
      const savedHabits = localStorage.getItem('habits')
      const savedCompletions = localStorage.getItem('completions')
      const savedNotifications = localStorage.getItem('notifications')
      
      if (savedHabits) habits.value = JSON.parse(savedHabits)
      if (savedCompletions) completions.value = JSON.parse(savedCompletions)
      if (savedNotifications) notifications.value = JSON.parse(savedNotifications)
      
      // Add initial notification
      if (notifications.value.length === 0) {
        addNotification("Welcome to your habit tracker! Let's build some great habits together!", 'info')
      }
      
      // Add motivational notifications periodically
      setInterval(() => {
        if (Math.random() > 0.7) {
          addNotification(
            MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
            'motivational'
          )
        }
      }, 300000) // Every 5 minutes
    })
    
    // Save data to localStorage when data changes
    watch([habits, completions, notifications], () => {
      localStorage.setItem('habits', JSON.stringify(habits.value))
      localStorage.setItem('completions', JSON.stringify(completions.value))
      localStorage.setItem('notifications', JSON.stringify(notifications.value))
    }, { deep: true })
    
    return {
      activeTab,
      selectedDate,
      habits,
      completions,
      notifications,
      showNewHabitForm,
      weekDays,
      maxStreak,
      completionRate,
      weeklyStats,
      monthlyTrendPoints,
      colors: COLORS,
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
      goToToday
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
  padding: 0 2rem;
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
  align-items: end;
  justify-content: space-around;
  padding: 1rem;
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
</style>

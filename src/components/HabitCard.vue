<template>
  <div class="habit-card card animate-fade-in-up hover-lift">
    <div class="habit-header">
      <div class="habit-info">
        <h3 class="habit-name font-semibold">{{ habit.name }}</h3>
        <div class="habit-meta">
          <span class="habit-frequency">{{ habit.frequency }}</span>
          <span class="habit-separator">•</span>
          <span class="habit-reminder">{{ habit.reminderTime || 'No reminder' }}</span>
        </div>
      </div>
      <div class="habit-color animate-pulse" :style="{ backgroundColor: habit.color }"></div>
    </div>
    
    <div v-if="habit.description" class="habit-description">
      <p class="text-sm text-gray-600">{{ habit.description }}</p>
    </div>
    
    <div class="habit-stats">
      <div class="stat animate-fade-in-left animate-stagger-1">
        <span class="stat-label">Streak</span>
        <span class="stat-value">{{ streak }} days</span>
      </div>
      <div class="stat animate-fade-in-left animate-stagger-2">
        <span class="stat-label">Completion</span>
        <span class="stat-value">{{ completionRate }}%</span>
      </div>
    </div>
    
    <div class="habit-actions">
      <button
        @click="toggleCompletion"
        :class="[
          'btn',
          'w-full',
          'interactive',
          'ripple',
          {
            'btn-completed animate-bounce-in': todayCompletion?.completed,
            'btn-primary': !todayCompletion?.completed
          }
        ]"
      >
        <span v-if="todayCompletion?.completed">✓ Completed Today</span>
        <span v-else>Mark Complete</span>
      </button>
      
      <div class="habit-controls">
        <button @click="$emit('edit', habit)" class="btn btn-outline btn-sm interactive hover-scale">
          Edit
        </button>
        <button @click="confirmDelete" class="btn btn-danger btn-sm delete-btn interactive hover-rotate">
          🗑️
        </button>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="delete-modal animate-fade-in">
        <div class="delete-modal-content animate-scale-in">
          <h3>Delete Habit</h3>
          <p>Are you sure you want to delete "{{ habit.name }}"? This action cannot be undone.</p>
          <div class="delete-modal-actions">
            <button @click="cancelDelete" class="btn btn-outline btn-sm interactive">Cancel</button>
            <button @click="confirmDeleteAction" class="btn btn-danger btn-sm interactive animate-shake">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { format, parseISO, isSameDay } from 'date-fns'

export default {
  name: 'HabitCard',
  props: {
    habit: {
      type: Object,
      required: true
    },
    completions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['edit', 'delete', 'toggle-completion'],
  setup(props, { emit }) {
    const showDeleteConfirm = ref(false)
    
    const confirmDelete = () => {
      showDeleteConfirm.value = true
    }
    
    const cancelDelete = () => {
      showDeleteConfirm.value = false
    }
    
    const confirmDeleteAction = () => {
      emit('delete', props.habit.id)
      showDeleteConfirm.value = false
    }
    const todayCompletion = computed(() => {
      const today = new Date()
      const dateStr = format(today, 'yyyy-MM-dd')
      return props.completions.find(c => 
        c.habitId === props.habit.id && c.date === dateStr
      )
    })
    
    const streak = computed(() => {
      const habitCompletions = props.completions
        .filter(c => c.habitId === props.habit.id && c.completed)
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
    })
    
    const completionRate = computed(() => {
      const totalCompletions = props.completions.filter(c => c.habitId === props.habit.id)
      const completedCount = totalCompletions.filter(c => c.completed).length
      return totalCompletions.length > 0 ? Math.round((completedCount / totalCompletions.length) * 100) : 0
    })
    
    const toggleCompletion = () => {
      emit('toggle-completion', props.habit.id, new Date())
    }
    
    return {
      showDeleteConfirm,
      todayCompletion,
      streak,
      completionRate,
      toggleCompletion,
      confirmDelete,
      cancelDelete,
      confirmDeleteAction
    }
  }
}
</script>

<style lang="scss" scoped>
.habit-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
}

.habit-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.habit-info {
  flex: 1;
}

.habit-name {
  color: $primary-black;
  margin-bottom: 0.5rem;
}

.habit-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: $gray-500;
}

.habit-separator {
  color: $gray-400;
}

.habit-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.habit-description {
  margin-bottom: 1rem;
}

.habit-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 0.5rem;
}

.stat {
  text-align: center;
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
}

.habit-actions {
  .btn {
    margin-bottom: 0.75rem;
  }
  
  &.btn-completed {
    background: $gray-200;
    color: $primary-black;
    
    &:hover {
      background: $gray-300;
    }
  }
}

.habit-controls {
  display: flex;
  gap: 0.5rem;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  
  &:hover {
    background-color: #c82333;
  }
}

.delete-modal {
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

.delete-modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  
  h3 {
    color: #dc3545;
    margin-bottom: 1rem;
  }
  
  p {
    color: #666;
    margin-bottom: 1.5rem;
  }
}

.delete-modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.w-full {
  width: 100%;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-600 {
  color: $gray-600;
}
</style>

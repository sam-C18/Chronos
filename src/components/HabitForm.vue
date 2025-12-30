<template>
  <div class="notion-habit-form">
    <div class="notion-form-header">
      <h3 class="notion-form-title font-display">{{ isEditing ? 'Edit Habit' : 'Create New Habit' }}</h3>
      <p class="notion-form-subtitle">{{ isEditing ? 'Update your habit details' : 'Add a new habit to track' }}</p>
    </div>
    
    <form @submit.prevent="handleSubmit" class="notion-habit-form-content">
      <div class="notion-form-group">
        <label for="habit-name" class="notion-form-label">Habit Name</label>
        <input
          id="habit-name"
          v-model="form.name"
          type="text"
          class="notion-form-input"
          placeholder="e.g., Morning Meditation"
          required
        />
      </div>
      
      <div class="notion-form-group">
        <label for="habit-description" class="notion-form-label">Description <span class="optional">(optional)</span></label>
        <textarea
          id="habit-description"
          v-model="form.description"
          class="notion-form-textarea"
          placeholder="Add a brief description of your habit"
          rows="3"
        />
      </div>
      
      <div class="notion-form-group">
        <label for="habit-frequency" class="notion-form-label">Frequency</label>
        <select
          id="habit-frequency"
          v-model="form.frequency"
          class="notion-form-select"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <div class="notion-form-group">
        <label for="habit-reminder" class="notion-form-label">Reminder Time <span class="optional">(optional)</span></label>
        <input
          id="habit-reminder"
          v-model="form.reminderTime"
          type="time"
          class="notion-form-input"
        />
      </div>
      
      <div class="notion-form-group">
        <label class="notion-form-label">Color</label>
        <div class="notion-color-picker">
          <button
            v-for="(color, index) in colors"
            :key="color"
            type="button"
            @click="form.color = color"
            :class="[
              'notion-color-option',
              { 'notion-color-selected': form.color === color }
            ]"
            :style="{ backgroundColor: color }"
            :title="`Color ${index + 1}`"
          />
        </div>
      </div>
      
      <div class="notion-form-actions">
        <button type="submit" class="notion-btn notion-btn-primary">
          {{ isEditing ? 'Update Habit' : 'Create Habit' }}
        </button>
        <button type="button" @click="$emit('cancel')" class="notion-btn notion-btn-outline">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, watch, computed } from 'vue'

export default {
  name: 'HabitForm',
  props: {
    habit: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const colors = [
      '#df2531', '#f3701e', '#e8d8c9', '#ffed00',
      '#9fd700', '#00a6c0', '#60519b', '#c837ab'
    ]
    
    const form = reactive({
      name: '',
      description: '',
      frequency: 'daily',
      reminderTime: '',
      color: colors[0],
      targetDays: 7
    })
    
    const isEditing = computed(() => !!props.habit)
    
    // Watch for habit prop changes to populate form
    watch(() => props.habit, (newHabit) => {
      if (newHabit) {
        Object.assign(form, {
          name: newHabit.name || '',
          description: newHabit.description || '',
          frequency: newHabit.frequency || 'daily',
          reminderTime: newHabit.reminderTime || '',
          color: newHabit.color || colors[0],
          targetDays: newHabit.targetDays || 7
        })
      } else {
        // Reset form for new habit
        Object.assign(form, {
          name: '',
          description: '',
          frequency: 'daily',
          reminderTime: '',
          color: colors[0],
          targetDays: 7
        })
      }
    }, { immediate: true })
    
    const handleSubmit = () => {
      if (form.name.trim()) {
        const habitData = { ...form }
        if (props.habit) {
          habitData.id = props.habit.id
        }
        emit('submit', habitData)
        // Don't reset form here for editing, let parent handle it
        if (!props.habit) {
          Object.assign(form, {
            name: '',
            description: '',
            frequency: 'daily',
            reminderTime: '',
            color: colors[0],
            targetDays: 7
          })
        }
      }
    }
    
    return {
      colors,
      form,
      isEditing,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/main.scss';

.notion-habit-form {
  background: $primary-white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.notion-form-header {
  padding: 1.5rem 1.5rem 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  
  .notion-form-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: $primary-black;
    margin-bottom: 0.25rem;
    letter-spacing: -0.01em;
  }
  
  .notion-form-subtitle {
    font-size: 0.8125rem;
    color: $gray-600;
    font-weight: 400;
    margin: 0;
  }
}

.notion-habit-form-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.notion-form-group {
  display: flex;
  flex-direction: column;
}

.notion-form-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: $primary-black;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  
  .optional {
    font-weight: 400;
    color: $gray-500;
    text-transform: none;
    font-size: 0.75rem;
  }
}

.notion-form-input,
.notion-form-textarea,
.notion-form-select {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  background: $primary-white;
  color: $primary-black;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  font-family: $font-primary;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: $primary-black;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
  
  &::placeholder {
    color: $gray-500;
  }
}

.notion-form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: $font-primary;
}

.notion-form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23000' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
}

.notion-color-picker {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.notion-color-option {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    transform: scale(1.05);
    border-color: rgba(0, 0, 0, 0.2);
  }
  
  &.notion-color-selected {
    border-color: $primary-black;
    border-width: 3px;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
  }
}

.notion-form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.notion-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.9375rem;
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
}
</style>

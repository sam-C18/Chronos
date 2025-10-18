<template>
  <div class="login-form-container glass">
    <div class="form-header">
      <h3 class="font-display text-lg font-semibold mb-4">Create New Habit</h3>
    </div>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="form-group">
        <label for="habit-name" class="form-label">Habit Name</label>
        <input
          id="habit-name"
          v-model="form.name"
          type="text"
          class="input"
          placeholder="Enter habit name"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="habit-description" class="form-label">Description (optional)</label>
        <textarea
          id="habit-description"
          v-model="form.description"
          class="textarea"
          placeholder="Describe your habit"
          rows="3"
        />
      </div>
      
      <div class="form-group">
        <label for="habit-frequency" class="form-label">Frequency</label>
        <select
          id="habit-frequency"
          v-model="form.frequency"
          class="select"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="habit-reminder" class="form-label">Reminder Time</label>
        <input
          id="habit-reminder"
          v-model="form.reminderTime"
          type="time"
          class="input"
        />
      </div>
      
      <div class="form-group">
        <label class="form-label">Color</label>
        <div class="color-picker">
          <button
            v-for="color in colors"
            :key="color"
            type="button"
            @click="form.color = color"
            :class="[
              'color-option',
              { 'color-option-selected': form.color === color }
            ]"
            :style="{ backgroundColor: color }"
          />
        </div>
      </div>
      
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">
          Create Habit
        </button>
        <button type="button" @click="$emit('cancel')" class="btn btn-outline">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  name: 'HabitForm',
  emits: ['submit', 'cancel'],
  setup(_, { emit }) {
    const colors = [
      '#000000', '#6c757d', '#495057', '#343a40',
      '#212529', '#adb5bd', '#dee2e6', '#e9ecef'
    ]
    
    const form = reactive({
      name: '',
      description: '',
      frequency: 'daily',
      reminderTime: '',
      color: colors[0],
      targetDays: 7
    })
    
    const handleSubmit = () => {
      if (form.name.trim()) {
        emit('submit', { ...form })
        // Reset form
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
    
    return {
      colors,
      form,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.login-form-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: $primary-black;
}

.color-picker {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.color-option-selected {
    border-color: $primary-black;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>

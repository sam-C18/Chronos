<template>
  <div class="profile-page">

    <Navbar />

    <div class="profile-content notion-profile-content">
      <div class="container notion-container">
        <div class="notion-card notion-profile-card animate-scale-in">
          <div class="notion-card-header">
            <div>
              <h1 class="profile-page-title font-display">Profile Settings</h1>
              <p class="profile-page-subtitle">Your profile is saved in this browser</p>
            </div>
          </div>

          <div class="notion-card-content">
            <form @submit.prevent="handleSubmit" class="notion-profile-form">
              <div class="notion-form-group">
                <label for="name" class="notion-form-label">Name</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  class="notion-input"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div v-if="message" class="notion-message" :class="{ 'notion-message-error': message.type === 'error', 'notion-message-success': message.type === 'success' }">
                {{ message.text }}
              </div>

              <div class="notion-form-actions">
                <button type="submit" class="notion-btn notion-btn-primary notion-btn-lg">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '../stores/user.js'
import Navbar from '../components/Navbar.vue'

export default {
  name: 'Profile',
  components: {
    Navbar
  },
  setup() {
    const userStore = useUserStore()

    const form = reactive({
      name: ''
    })

    const message = ref(null)

    const fetchProfile = () => {
      form.name = userStore.profile.name || ''
    }

    const handleSubmit = async () => {
      if (!form.name.trim()) {
        message.value = { type: 'error', text: 'Username is required' }
        return
      }

      message.value = null
      try {
        userStore.updateName(form.name.trim())
        message.value = { type: 'success', text: 'Profile saved in this browser.' }
      } catch (error) {
        message.value = { type: 'error', text: 'Could not save the profile. Check browser storage space and try again.' }
      }
    }

    onMounted(() => {
      fetchProfile()
    })

    return {
      form,
      message,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/main.scss';

.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow-x: hidden;
}

.notion-profile-content {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.notion-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 1rem;
}

.notion-profile-card {
  background: $primary-white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
}

.profile-page-title {
  font-size: 2rem;
  font-weight: 700;
  color: $primary-black;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.profile-page-subtitle {
  font-size: 0.9375rem;
  color: $gray-600;
  font-weight: 400;
}

.notion-profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.notion-form-group {
  display: flex;
  flex-direction: column;
}

.notion-form-label {
  font-weight: 600;
  color: $primary-black;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.notion-input {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 6px;
  background: $primary-white;
  color: $primary-black;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: $font-primary;
  
  &:focus {
    outline: none;
    border-color: $primary-black;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(0, 0, 0, 0.02);
  }
  
  &::placeholder {
    color: $gray-500;
  }
}

.notion-form-hint {
  font-size: 0.8125rem;
  color: $gray-500;
  margin-top: 0.375rem;
}

.notion-message {
  padding: 0.875rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  text-align: center;
  border: 1px solid;
}

.notion-message-success {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.notion-message-error {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.notion-form-actions {
  margin-top: 0.5rem;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.12);
  }
  
  &.notion-btn-primary {
    background: $primary-black;
    color: $primary-white;
    border-color: $primary-black;
    
    &:hover:not(:disabled) {
      background: $gray-800;
      border-color: $gray-800;
    }
  }
  
  &.notion-btn-lg {
    padding: 0.875rem 1.75rem;
    font-size: 1rem;
    width: 100%;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.w-full {
  width: 100%;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #9ca3af;
}
</style>

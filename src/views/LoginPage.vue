<template>
  <div class="login-page">
    <div class="grain-overlay"></div>
    <div class="login-container">
      <div class="login-card glass animate-scale-in">
        <div class="login-header animate-fade-in-up">
          <h1 class="font-display text-3xl font-bold mb-2">Habit Tracker</h1>
          <p class="text-gray-600 mb-8">Build better habits, one day at a time</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group animate-fade-in-left animate-stagger-1">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="input transition-all"
              placeholder="Enter your email"
              required
              @blur="checkEmail"
            />
            <p v-if="errors.email" class="error-message animate-shake">{{ errors.email }}</p>
          </div>
          
          <div class="form-group animate-fade-in-left animate-stagger-2">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input transition-all"
              placeholder="Enter your password"
              required
            />
            <p v-if="errors.password" class="error-message animate-shake">{{ errors.password }}</p>
          </div>
          
          <div v-if="!isLogin" class="form-group animate-fade-in-left animate-stagger-3">
            <label for="name" class="form-label">Name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              class="input transition-all"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <p v-if="errors.general" class="error-message general animate-shake">{{ errors.general }}</p>
          
          <div class="form-actions animate-fade-in-up animate-stagger-3">
            <button type="submit" class="btn btn-primary btn-lg w-full interactive ripple" :disabled="loading">
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up') }}
            </button>
          </div>
          
          <div class="form-switch animate-fade-in-up animate-stagger-4">
            <p class="text-sm text-gray-600">
              {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
              <button
                type="button"
                @click="toggleMode"
                class="text-black font-medium hover:underline"
              >
                {{ isLogin ? 'Sign Up' : 'Sign In' }}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import config from '../config.js'
import { useUserStore } from '../stores/user.js'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const userStore = useUserStore()
    const isLogin = ref(true)
    
    const form = reactive({
      email: '',
      password: '',
      name: ''
    })
    
    const errors = reactive({
      email: '',
      password: '',
      general: ''
    })
    
    const loading = ref(false)
    const emailChecked = ref(false)
    const emailExists = ref(false)
    
    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('reset') === 'success') {
        resetSuccess.value = true
        // Clear the URL parameter
        router.replace('/login')
      }
    })
    
    const toggleMode = () => {
      isLogin.value = !isLogin.value
      // Reset errors when switching modes
      errors.email = ''
      errors.password = ''
      errors.general = ''
      form.name = ''
      emailChecked.value = false
    }
    
    const checkEmail = async () => {
      if (!form.email) return
      
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/check-email?email=${form.email}`)
        emailExists.value = response.data.exists
        emailChecked.value = true
        
        if (isLogin.value) {
          if (!emailExists.value) {
            errors.email = 'No account found with this email. Please sign up.'
          } else {
            errors.email = ''
          }
        } else {
          if (emailExists.value) {
            errors.email = 'An account with this email already exists. Please sign in.'
          } else {
            errors.email = ''
          }
        }
      } catch (error) {
        console.error('Error checking email:', error)
        errors.email = 'Error checking email availability'
      }
    }
    
    const handleSubmit = async () => {
      // Reset errors
      errors.general = ''
      errors.password = ''
      
      if (!form.email || !form.password || (!isLogin.value && !(form.name?.trim()))) {
        errors.general = 'Please fill in all fields'
        return
      }
      
      loading.value = true
      
      try {
        let response
        if (isLogin.value) {
          response = await axios.post(`${config.API_BASE_URL}/api/login`, {
            email: form.email,
            password: form.password
          })
          // Clear any existing user data before setting new user
          clearUserData()
          userStore.setUser(response.data.user)
          router.push('/dashboard')
        } else {
          response = await axios.post(`${config.API_BASE_URL}/api/signup`, {
            email: form.email,
            password: form.password,
            name: form.name
          })
          // Clear any existing user data before setting new user
          clearUserData()
          // After signup, automatically log in
          const loginResponse = await axios.post(`${config.API_BASE_URL}/api/login`, {
            email: form.email,
            password: form.password
          })
          userStore.setUser(loginResponse.data.user)
          router.push('/dashboard')
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status === 409) {
            errors.email = error.response.data.error
          } else if (error.response.status === 404) {
            errors.email = error.response.data.error
          } else if (error.response.status === 401) {
            errors.password = error.response.data.error
          } else {
            errors.general = error.response.data.error || 'An error occurred'
          }
        } else {
          errors.general = 'Network error. Please try again.'
        }
      } finally {
        loading.value = false
      }
    }
    
    const clearUserData = () => {
      // Clear all user-specific data from localStorage
      localStorage.removeItem('habits')
      localStorage.removeItem('completions')
      localStorage.removeItem('notifications')
      // Keep the user data as it will be updated
    }
    
    return {
      isLogin,
      form,
      errors,
      loading,
      emailChecked,
      emailExists,
      toggleMode,
      checkEmail,
      handleSubmit
    }
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-form {
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: $primary-black;
  }
  
  .error-message {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    
    &.general {
      text-align: center;
      margin-bottom: 1rem;
    }
  }
  
  .form-actions {
    margin-bottom: 1.5rem;
  }
  
  .form-switch {
    text-align: center;
  }
}

.w-full {
  width: 100%;
}

.text-gray-600 {
  color: $gray-600;
}

.text-black {
  color: $primary-black;
}

.hover\:underline:hover {
  text-decoration: underline;
}
</style>

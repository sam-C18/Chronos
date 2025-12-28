<template>
  <div class="login-page">
    <div class="grain-overlay"></div>
    <div class="login-container">
      <div class="login-card glass">
        <div class="login-header">
          <h1 class="font-display text-3xl font-bold mb-2">Habit Tracker</h1>
          <p class="text-gray-600 mb-8">Build better habits, one day at a time</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="input"
              placeholder="Enter your email"
              required
              @blur="checkEmail"
            />
            <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="input"
              placeholder="Enter your password"
              required
            />
            <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
          </div>
          
          <p v-if="errors.general" class="error-message general">{{ errors.general }}</p>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
              {{ loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up') }}
            </button>
          </div>
          
          <div class="form-switch">
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const isLogin = ref(true)
    
    const form = reactive({
      email: '',
      password: ''
    })
    
    const errors = reactive({
      email: '',
      password: '',
      general: ''
    })
    
    const loading = ref(false)
    const emailChecked = ref(false)
    const emailExists = ref(false)
    
    const toggleMode = () => {
      isLogin.value = !isLogin.value
      // Reset errors when switching modes
      errors.email = ''
      errors.password = ''
      errors.general = ''
      emailChecked.value = false
    }
    
    const checkEmail = async () => {
      if (!form.email) return
      
      try {
        const response = await axios.get(`http://localhost:3000/api/check-email?email=${form.email}`)
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
      
      if (!form.email || !form.password) {
        errors.general = 'Please fill in all fields'
        return
      }
      
      loading.value = true
      
      try {
        let response
        if (isLogin.value) {
          response = await axios.post('http://localhost:3000/api/login', {
            email: form.email,
            password: form.password
          })
          // Clear any existing user data before setting new user
          clearUserData()
          localStorage.setItem('user', JSON.stringify(response.data.user))
          router.push('/dashboard')
        } else {
          response = await axios.post('http://localhost:3000/api/signup', {
            email: form.email,
            password: form.password
          })
          // Clear any existing user data before setting new user
          clearUserData()
          // After signup, automatically log in
          const loginResponse = await axios.post('http://localhost:3000/api/login', {
            email: form.email,
            password: form.password
          })
          localStorage.setItem('user', JSON.stringify(loginResponse.data.user))
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

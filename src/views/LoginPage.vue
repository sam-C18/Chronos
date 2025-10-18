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
            />
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
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn btn-primary btn-lg w-full">
              {{ isLogin ? 'Sign In' : 'Sign Up' }}
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

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const isLogin = ref(true)
    
    const form = reactive({
      email: '',
      password: ''
    })
    
    const toggleMode = () => {
      isLogin.value = !isLogin.value
    }
    
    const handleSubmit = () => {
      // Simple authentication simulation
      if (form.email && form.password) {
        localStorage.setItem('user', JSON.stringify({
          email: form.email,
          name: form.email.split('@')[0]
        }))
        router.push('/dashboard')
      }
    }
    
    return {
      isLogin,
      form,
      toggleMode,
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

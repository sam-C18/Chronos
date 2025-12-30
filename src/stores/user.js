import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const updateName = (newName) => {
    if (user.value) {
      user.value.name = newName
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  return {
    user,
    setUser,
    updateName,
    logout
  }
})
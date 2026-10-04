import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'chronos.local-profile.v1'
const emptyProfile = () => ({
  name: 'My Profile',
  habits: [],
  completions: [],
  notifications: []
})

const readProfile = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return emptyProfile()
    return {
      name: typeof saved.name === 'string' ? saved.name : 'My Profile',
      habits: Array.isArray(saved.habits) ? saved.habits : [],
      completions: Array.isArray(saved.completions) ? saved.completions : [],
      notifications: Array.isArray(saved.notifications) ? saved.notifications : []
    }
  } catch (error) {
    console.warn('Could not read the local profile; starting with an empty profile.', error)
    return emptyProfile()
  }
}

export const useUserStore = defineStore('user', () => {
  const profile = ref(readProfile())
  const user = ref({ id: 'local-profile', name: profile.value.name })

  const persist = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.value))
    } catch (error) {
      console.error('Could not save the local profile.', error)
      throw error
    }
  }

  const updateName = (newName) => {
    profile.value.name = newName
    user.value = { id: 'local-profile', name: newName }
    persist()
  }

  const saveData = ({ habits, completions, notifications }) => {
    profile.value = { ...profile.value, habits, completions, notifications }
    persist()
  }

  const ensureProfile = () => {
    user.value = { id: 'local-profile', name: profile.value.name }
    persist()
  }

  return { user, profile, updateName, saveData, ensureProfile }
})

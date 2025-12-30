<template>
  <div class="navbar">
    <div class="navbar-content">
      <div class="navbar-brand">
        <h1 class="font-display text-xl font-bold" @click="goToDashboard" style="cursor: pointer;">Habit Tracker</h1>
      </div>
      
      <div class="navbar-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="setActiveTab(tab.id)"
          :class="[
            'nav-tab',
            { 'nav-tab-active': activeTab === tab.id }
          ]"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <div class="navbar-actions">
        <div class="notifications-container">
          <button
            @click="toggleNotifications"
            class="notification-btn"
            aria-label="Notifications"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              v-if="unreadCount > 0"
              class="notification-badge"
            >
              {{ unreadCount }}
            </span>
          </button>
          
          <transition name="slide-down">
            <div
              v-if="showNotifications"
              class="notifications-dropdown glass"
            >
              <div class="notifications-header">
                <h3 class="font-semibold">Notifications</h3>
              </div>
              <div class="notifications-list">
                <div
                  v-for="notification in notifications"
                  :key="notification.id"
                  @click="markAsRead(notification.id)"
                  :class="[
                    'notification-item',
                    { 'notification-unread': !notification.read }
                  ]"
                >
                  <p class="notification-message">{{ notification.message }}</p>
                  <p class="notification-time">
                    {{ formatTime(notification.timestamp) }}
                  </p>
                </div>
                <div v-if="notifications.length === 0" class="notification-empty">
                  No notifications yet
                </div>
              </div>
            </div>
          </transition>
        </div>
        
        <button @click="goToProfile" class="btn btn-outline btn-sm">
          Profile
        </button>
        
        <button @click="logout" class="btn btn-outline btn-sm">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { format, parseISO } from 'date-fns'
import { useUserStore } from '../stores/user.js'

export default {
  name: 'Navbar',
  props: {
    activeTab: {
      type: String,
      default: 'dashboard'
    }
  },
  emits: ['tab-change'],
  setup(props, { emit }) {
    const router = useRouter()
    const userStore = useUserStore()
    const showNotifications = ref(false)
    
    const tabs = [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'calendar', label: 'Calendar' },
      { id: 'analytics', label: 'Analytics' },
      { id: 'habits', label: 'Habits' }
    ]
    
    const notifications = ref([
      {
        id: '1',
        message: "Welcome to your habit tracker! Let's build some great habits together!",
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      }
    ])
    
    const unreadCount = computed(() => 
      notifications.value.filter(n => !n.read).length
    )
    
    const setActiveTab = async (tabId) => {
      // If we're not on dashboard, navigate there first
      if (router.currentRoute.value.path !== '/dashboard') {
        router.push('/dashboard')
        // Wait for the route to change and component to mount, then emit the tab change
        await nextTick()
        // Small delay to ensure Dashboard component is fully mounted
        setTimeout(() => {
          emit('tab-change', tabId)
        }, 50)
      } else {
        emit('tab-change', tabId)
      }
    }
    
    const goToDashboard = () => {
      router.push('/dashboard')
    }
    
    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value
    }
    
    const markAsRead = (id) => {
      const notification = notifications.value.find(n => n.id === id)
      if (notification) {
        notification.read = true
      }
    }
    
    const formatTime = (timestamp) => {
      return format(parseISO(timestamp), 'MMM d, h:mm a')
    }
    
    const logout = () => {
      userStore.logout()
      router.push('/')
    }
    
    const goToProfile = () => {
      router.push('/profile')
    }
    
    return {
      tabs,
      notifications,
      unreadCount,
      showNotifications,
      setActiveTab,
      toggleNotifications,
      markAsRead,
      formatTime,
      logout,
      goToProfile,
      goToDashboard
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand h1 {
  color: $primary-black;
}

.navbar-nav {
  display: flex;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  padding: 0.25rem;
  border-radius: 0.5rem;
}

.nav-tab {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: $gray-600;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: $primary-black;
    background: rgba(255, 255, 255, 0.5);
  }
  
  &.nav-tab-active {
    background: $primary-white;
    color: $primary-black;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notifications-container {
  position: relative;
}

.notification-btn {
  position: relative;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  svg {
    color: $gray-600;
  }
}

.notification-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  background: $primary-black;
  color: $primary-white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 50%;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notifications-dropdown {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  width: 20rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.notifications-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.notifications-list {
  max-height: 15rem;
  overflow-y: auto;
}

.notification-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.02);
  }
  
  &.notification-unread {
    background: rgba(0, 0, 0, 0.02);
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.notification-message {
  font-size: 0.875rem;
  color: $primary-black;
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.75rem;
  color: $gray-500;
}

.notification-empty {
  padding: 2rem;
  text-align: center;
  color: $gray-500;
  font-size: 0.875rem;
}

.w-5 {
  width: 1.25rem;
}

.h-5 {
  height: 1.25rem;
}
</style>

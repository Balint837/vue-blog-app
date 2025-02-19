<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()

// State
const isEditing = ref(false)
const isChangingPassword = ref(false)
const error = ref<string | null>(null)

const editForm = ref({
  name: authStore.user?.name || '',
  email: authStore.user?.email || '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
})

const isAuthenticated = computed(() => authStore.isAuthenticated)

const startEditing = () => {
  isEditing.value = true
  isChangingPassword.value = false
  editForm.value = { ...authStore.user! }
}

const cancelEditing = () => {
  isEditing.value = false
  error.value = null
}

const handleProfileUpdate = async () => {
  if (!authStore.user) {
    error.value = 'Felhasználó nem található'
    return
  }

  try {
    const response = await axios.put<{ message: string; user: User }>('/profile/update', {
      id: authStore.user.id,
      ...editForm.value,
    })

    if (response.status === 200 && response.data.user) {
      authStore.setUser(response.data.user)
      isEditing.value = false
      error.value = null
    } else {
      error.value = 'Ismeretlen hiba történt'
    }
  } catch (err: any) {
    console.log(err)
    error.value = err.response?.data?.message || 'Hiba történt'
  }
}

const startPasswordChange = () => {
  isChangingPassword.value = true
  isEditing.value = false
  passwordForm.value = { currentPassword: '', newPassword: '' }
}

const cancelPasswordChange = () => {
  isChangingPassword.value = false
  error.value = null
}

const handlePasswordChange = async () => {
  try {
    await axios.put('/profile/change-password', {
      id: authStore.user!.id,
      ...passwordForm.value,
    })

    isChangingPassword.value = false
    error.value = null
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Hiba történt'
  }
}

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div class="w-full max-w-lg bg-white shadow-lg rounded-xl p-6">
      <h2 class="text-center text-2xl font-bold text-gray-900">Profil</h2>

      <div v-if="isAuthenticated" class="mt-6 space-y-6">
        <!-- Display Profile Information -->
        <div v-if="!isEditing && !isChangingPassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Név</label>
            <p class="text-lg font-medium text-gray-900">{{ authStore.user?.name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <p class="text-lg font-medium text-gray-900">{{ authStore.user?.email }}</p>
          </div>
          <div class="flex justify-center gap-4 pt-4">
            <button @click="startEditing" class="px-4 py-2 bg-indigo-600 text-white rounded-md">
              Profil szerkesztése
            </button>
            <button
              @click="startPasswordChange"
              class="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Jelszó módosítása
            </button>
          </div>
        </div>

        <!-- Edit Profile Form -->
        <form v-if="isEditing" @submit.prevent="handleProfileUpdate" class="space-y-4">
          <div>
            <label for="edit-name" class="block text-sm font-medium text-gray-700">Név</label>
            <input
              id="edit-name"
              v-model="editForm.name"
              type="text"
              class="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label for="edit-email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="edit-email"
              v-model="editForm.email"
              type="email"
              class="w-full p-2 border rounded-md"
              required
            />
          </div>
          <p v-if="error" class="text-red-500">{{ error }}</p>
          <div class="flex justify-center gap-4 pt-4">
            <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-md">
              Mentés
            </button>
            <button @click="cancelEditing" class="px-4 py-2 bg-gray-300 rounded-md">Mégse</button>
          </div>
        </form>

        <!-- Change Password Form -->
        <form v-if="isChangingPassword" @submit.prevent="handlePasswordChange" class="space-y-4">
          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-700"
              >Jelenlegi jelszó</label
            >
            <input
              id="current-password"
              v-model="passwordForm.currentPassword"
              type="password"
              class="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700"
              >Új jelszó</label
            >
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full p-2 border rounded-md"
              required
            />
          </div>
          <p v-if="error" class="text-red-500">{{ error }}</p>
          <div class="flex justify-center gap-4 pt-4">
            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-md">
              Jelszó módosítása
            </button>
            <button @click="cancelPasswordChange" class="px-4 py-2 bg-gray-300 rounded-md">
              Mégse
            </button>
          </div>
        </form>
      </div>

      <!-- Logout Button -->
      <div class="flex justify-center pt-8">
        <button @click="handleLogout" class="px-6 py-3 bg-red-600 text-white rounded-md">
          Kijelentkezés
        </button>
      </div>
    </div>
  </div>
</template>

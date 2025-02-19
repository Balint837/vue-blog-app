<template>
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Bejelentkezés</h2>
        <p class="text-gray-500 mt-2">Lépj be a fiókodba</p>
      </div>

      <form class="mt-6 space-y-6" @submit.prevent="handleSubmit">
        <!-- Email Input -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            type="email"
            required
            v-model="email"
            class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            :class="{ 'border-red-500': error }"
            placeholder="Email címed"
          />
        </div>

        <!-- Password Input -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Jelszó</label>
          <input
            id="password"
            type="password"
            required
            v-model="password"
            class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            :class="{ 'border-red-500': error }"
            placeholder="Jelszavad"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
          {{ error }}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="w-full py-3 text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="flex items-center">
            <svg class="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Bejelentkezés...
          </span>
          <span v-else>Bejelentkezés</span>
        </button>
      </form>

      <!-- Register Link -->
      <p class="text-center text-gray-600 mt-4">
        Még nincs fiókod?
        <RouterLink to="/register" class="text-blue-600 font-semibold hover:underline"
          >Regisztrálj itt!</RouterLink
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { LoginCredentials } from '@/types/auth'

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const handleSubmit = async () => {
  try {
    error.value = ''
    isLoading.value = true

    const credentials: LoginCredentials = {
      email: email.value,
      password: password.value,
    }

    const result = await authStore.login(credentials)

    if (result.success) {
      router.push('/profile')
    } else {
      error.value = result.error
    }
  } catch (e) {
    error.value = 'Váratlan hiba történt. Kérjük, próbáld újra később.'
  } finally {
    isLoading.value = false
  }
}
</script>

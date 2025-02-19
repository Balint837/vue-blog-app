<template>
  <nav class="bg-gray-800 text-white p-4">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-lg font-bold">Blog</router-link>
      <div>
        <router-link to="/categories" class="px-3">Categories</router-link>
        <router-link v-if="isAuthenticated" to="/newpost" class="px-3">New Post</router-link>

        <!-- Show "Posts" if user is authenticated -->
        <router-link v-if="isAuthenticated" to="/myposts" class="px-3">My Posts</router-link>

        <!-- Show Login/Register if user is not authenticated -->
        <router-link v-if="!isAuthenticated" to="/login" class="px-3">Login</router-link>
        <router-link v-if="!isAuthenticated" to="/register" class="px-3">Register</router-link>

        <!-- Show Profile if user is authenticated -->
        <router-link v-if="isAuthenticated" to="/profile" class="px-3">Profile</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth' // Import the store

// Use the store to get the authentication status
const authStore = useAuthStore()
const isAuthenticated = authStore.isAuthenticated // Get the isAuthenticated computed value
</script>

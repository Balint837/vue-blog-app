<template>
  <div class="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900">
    <NavBar />
    <main class="flex-1 container mx-auto p-4">
      <router-view />
    </main>
    <Footer></Footer>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import Footer from '@/components/Footer.vue'
</script>

<style>
body {
  @apply font-sans;
}
</style>

<template>
  <div class="max-w-3xl mx-auto mt-10">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Kategóriák</h1>

    <div v-if="categories.length" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div v-for="category in categories" :key="category" class="flex justify-center">
        <div
          class="w-full max-w-xs p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-center rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
          @click="goToCategory(category)"
        >
          <span class="text-lg font-semibold tracking-wide">{{ category }}</span>
        </div>
      </div>
    </div>

    <p v-else class="text-center text-gray-500 mt-6">Nincsenek elérhető kategóriák.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

// Reactive State
const categories = ref<string[]>([])

const router = useRouter()

// Fetch Categories from Posts
const fetchCategories = async () => {
  try {
    const { data } = await axios.get('/posts') // Get all posts
    // Extract unique categories from posts
    const uniqueCategories = Array.from(
      new Set(data.map((post: { category: string }) => post.category))
    )
    categories.value = uniqueCategories
  } catch (error) {
    console.error('Hiba történt a kategóriák betöltésekor', error)
  }
}

// Redirect to HomeView with the selected category as a query param
const goToCategory = (category: string) => {
  router.push({ name: 'home', query: { category } })
}

// Fetch categories when the component is mounted
onMounted(() => {
  fetchCategories()
})
</script>

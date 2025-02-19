<template>
  <main class="min-h-screen bg-gray-100 py-10">
    <!-- Search Bar -->
    <div
      class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 p-4"
    >
      <input
        type="text"
        v-model="titleToSearch"
        placeholder="🔍 Keresés a címekben..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0"
      />
      <input
        type="text"
        v-model="categoryToSearch"
        placeholder="Kategória keresése..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0"
      />
      <button
        @click="fetchPosts(0)"
        class="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Keresés
      </button>
    </div>

    <!-- Posts Grid -->
    <div class="max-w-7xl mx-auto px-4 mt-8">
      <div
        v-if="posts.length"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"
      >
        <PostCard v-for="post in posts" :key="post.id" :post="post" />
      </div>
      <p v-else class="text-center text-gray-500 mt-6">Nincsenek találatok.</p>
    </div>

    <!-- Pagination -->
    <div class="flex justify-center mt-8" v-if="pages.length > 1">
      <button
        v-if="currentPage > 0"
        class="w-10 h-10 mx-1 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
        @click="fetchPosts(currentPage - 1)"
      >
        ←
      </button>
      <button
        v-for="page in pages"
        :key="page"
        :class="{
          'bg-blue-500': currentPage !== page - 1,
          'bg-blue-700': currentPage === page - 1,
          'text-white': currentPage !== page - 1,
        }"
        class="w-10 h-10 mx-1 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
        @click="fetchPosts(page - 1)"
      >
        {{ page }}
      </button>
      <button
        v-if="currentPage < pages.length - 1"
        class="w-10 h-10 mx-1 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
        @click="fetchPosts(currentPage + 1)"
      >
        →
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import type { IPost } from '@/types/post'
import PostCard from '@/components/PostCard.vue'

const posts = ref<IPost[]>([])
const titleToSearch = ref<string>('')
const categoryToSearch = ref<string>('')
const pages = ref<number[]>([])
const currentPage = ref<number>(0)
let maxPage = 1
const pageSize = 6
const route = useRoute()

const fetchPosts = async (pageIndex = 0) => {
  try {
    const { data } = await axios.get<IPost[]>('/posts')

    let filteredPosts = data
      .filter((post) => post.title.toLowerCase().includes(titleToSearch.value.toLowerCase()))
      .filter(
        (post) =>
          !categoryToSearch.value ||
          !categoryToSearch.value.trim() ||
          post.category.toLowerCase() == categoryToSearch.value.toLowerCase()
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Newest first

    posts.value = filteredPosts.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)

    currentPage.value = pageIndex

    maxPage = Math.ceil(filteredPosts.length / pageSize)
    pages.value = Array.from({ length: maxPage }, (_, i) => i + 1)
  } catch (error) {
    console.error('Hiba történt a bejegyzések betöltésekor', error)
  }
}

const setCategoryToSearch = (category: string) => {
  categoryToSearch.value = category
  fetchPosts(0) // Re-fetch posts for the selected category
}

// Watch for route changes and update category search input
watch(
  () => route.query.category,
  (newCategory) => {
    categoryToSearch.value = (newCategory as string) || ''
    fetchPosts(0) // Re-fetch posts when category is updated
  }
)

onMounted(() => {
  categoryToSearch.value = (route.query.category as string) || '' // Pre-fill category on load
  fetchPosts() // Fetch posts for the first page
})
</script>

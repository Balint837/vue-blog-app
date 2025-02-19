<template>
  <div class="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-gray-100 py-10">
    <h1 class="text-2xl font-bold mb-4">Your Posts</h1>

    <div v-if="posts.length" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>

    <p v-else class="text-center text-gray-500 mt-6">You have no posts yet.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import PostCard from '@/components/PostCard.vue' // Import the PostCard component

const posts = ref<any[]>([])
const fetchUserPosts = async () => {
  try {
    const { data } = await axios.get('/posts/user')
    posts.value = data
  } catch (error) {
    console.error('Error fetching user posts', error)
  }
}

onMounted(fetchUserPosts)
</script>

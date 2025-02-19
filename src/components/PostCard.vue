<!-- src/components/PostCard.vue -->
<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden transition transform hover:scale-105">
    <img v-if="post.image" class="w-full h-52 object-cover" :src="post.image" alt="Post image" />
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-800">{{ post.title }}</h2>
      <p class="text-gray-600 mt-2 line-clamp-3">{{ post.shortText }}</p>
      <RouterLink
        :to="`/posts/${post.id}`"
        class="block mt-4 text-blue-600 hover:underline font-medium"
      >
        Tovább olvasom →
      </RouterLink>

      <!-- Conditionally display Edit and Delete buttons if the author is the current user -->
      <div v-if="isAuthor" class="mt-4 flex justify-between">
        <RouterLink
          :to="`/editpost/${post.id}`"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Edit
        </RouterLink>
        <button
          @click="deletePost"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { IPost } from '@/types/post'

const props = defineProps<{
  post: IPost
}>()

const authStore = useAuthStore()

const router = useRouter()

// Check if the current user is the author of the post
const isAuthor = ref(authStore.user?.id == props.post.authorId)

const deletePost = async () => {
  if (confirm('Are you sure you want to delete this post?')) {
    try {
      await axios.delete(`/posts/${props.post.id}`)
      router.push('/myposts') // Redirect after deletion
    } catch (error) {
      console.error('Error deleting post', error)
    }
  }
}
</script>

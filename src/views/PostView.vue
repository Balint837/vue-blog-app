<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
    <div v-if="post" class="max-w-3xl w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <img
        v-if="post.image"
        :src="post.image"
        alt="Blog Image"
        class="w-full h-72 object-contain"
      />

      <div class="p-6">
        <h1 class="text-3xl font-bold text-gray-900">{{ post.title }}</h1>
        <h2 v-if="post.subtitle" class="text-xl text-gray-600 mt-2">{{ post.subtitle }}</h2>

        <div class="mt-4 text-sm text-gray-500">
          <span class="font-semibold">Kategória:</span> {{ post.category }}
        </div>

        <div class="mt-6 text-gray-800">
          <p class="leading-relaxed whitespace-pre-line">{{ post.content }}</p>
        </div>

        <div class="mt-6 text-center">
          <router-link
            to="/"
            class="bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300"
          >
            Vissza a kezdőlapra
          </router-link>
        </div>
      </div>
    </div>

    <div v-else-if="errorMessage" class="text-red-500 font-semibold text-lg">
      {{ errorMessage }}
    </div>

    <div v-else class="text-gray-500 text-lg">Betöltés...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import type { IPost } from '@/types/post'

const route = useRoute()
const post = ref<IPost | null>(null)
const errorMessage = ref('')

onMounted(async () => {
  try {
    const { data } = await axios.get<IPost>(`/posts/${route.params.id}`)
    post.value = data
  } catch (error) {
    errorMessage.value = 'Hiba történt a bejegyzés betöltésekor.'
  }
})
</script>

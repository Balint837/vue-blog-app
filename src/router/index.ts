import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import PostsSelfView from '@/views/PostsSelfView.vue' // Import the new view

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/CategoriesView.vue'),
  },
  {
    path: '/posts/:id',
    name: 'Post',
    component: () => import('../views/PostView.vue'),
    props: true,
  },
  {
    path: '/editpost/:id?',
    name: 'Edit Post',
    component: () => import('../views/PostEdit.vue'),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: '/newpost',
    name: 'New Post',
    component: () => import('../views/PostNew.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/myposts',
    name: 'My Posts',
    component: () => import('../views/PostsUserView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initializeAuth()
  // Handle protected routes
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // Handle guest routes (e.g., login page)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/profile')
    return
  }

  next()
})

export default router

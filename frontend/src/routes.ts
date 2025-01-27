import { createRouter, createWebHistory } from 'vue-router'
import { routes as generatedRoutes } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/tasks',
    },
    ...generatedRoutes,
  ],
})

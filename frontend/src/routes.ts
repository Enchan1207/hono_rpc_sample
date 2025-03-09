import { createAuthGuard } from '@auth0/auth0-vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

const publicRoutes = ['/']

router.beforeEach(async (to, _, next) => {
  // パブリックルートは認証をスキップ
  const isSafeRoute = publicRoutes.includes(to.fullPath)
  if (isSafeRoute) {
    next(true)
    return
  }

  // 戻り値は "ログインしているか" を表す
  const isAuthorized = await createAuthGuard()(to)
  next(isAuthorized)
})

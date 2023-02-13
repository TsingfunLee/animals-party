import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export interface RouteMeta {
  name: string;
}

export enum RouteName {
  HOME = 'home',

  GAME_CONSOLE = 'game-console',
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: {
      name: RouteName.HOME,
    }
  },

  {
    path: `/home`,
    name: RouteName.HOME,
    component: () => import('../views/the-home.vue')
  },

  {
    path: `/game-console`,
    name: RouteName.GAME_CONSOLE,
    component: () => import('../views/game-console.vue'),
  },

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

export interface RouteMeta {
  name: string;
}

export enum RouteName {
  HOME = 'home',

  GAME_CONSOLE = 'game-console',

  GAME_CONSOLE_LOBBY = 'game-console-lobby',

  PLAYER_GAMEPAD = 'player-gamepad',

  PLAYER_GAMEPAD_LOBBY = 'player-gamepad-lobby'
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
    children: [
      {
        path: `lobby`,
        name: RouteName.GAME_CONSOLE_LOBBY,
        component: () => import('../views/game-console-lobby.vue')
      },
    ]
  },

  {
    path: `/player-gamepad`,
    name: RouteName.PLAYER_GAMEPAD,
    component: ()=>import('../views/player-gamepad.vue'),
    children: [
      {
        path:`lobby`,
        name: RouteName.PLAYER_GAMEPAD_LOBBY,
        component: ()=>import('../views/player-gamepad-lobby.vue')
      }
    ]
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

import { createRouter, createWebHistory } from 'vue-router'
import MemoList from '../views/MemoList.vue'
import MemoEditor from '../views/MemoEditor.vue'
import CalendarPage from '../views/CalendarPage.vue'
import DayMemos from '../views/DayMemos.vue'
import WeekSummary from '../views/WeekSummary.vue'
import TrashView from '../views/TrashView.vue'
import Settings from '../views/Settings.vue'
import LoginPage from '../views/LoginPage.vue'
import { isLoggedIn } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/',
      name: 'home',
      component: MemoList
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarPage
    },
    {
      path: '/editor/:id?',
      name: 'editor',
      component: MemoEditor
    },
    {
      path: '/day',
      name: 'day',
      component: DayMemos
    },
    {
      path: '/week',
      name: 'week',
      component: WeekSummary
    },
    {
      path: '/trash',
      name: 'trash',
      component: TrashView
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.name !== 'login'

  if (requiresAuth && !isLoggedIn.value) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isLoggedIn.value) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router

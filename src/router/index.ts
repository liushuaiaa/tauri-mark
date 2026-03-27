import { createRouter, createWebHistory } from 'vue-router'
import MemoList from '../views/MemoList.vue'
import MemoEditor from '../views/MemoEditor.vue'
import CalendarPage from '../views/CalendarPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
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
    }
  ]
})

export default router

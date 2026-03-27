import { createRouter, createWebHistory } from 'vue-router'
import MemoList from '../views/MemoList.vue'
import MemoEditor from '../views/MemoEditor.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MemoList
    },
    {
      path: '/editor/:id?',
      name: 'editor',
      component: MemoEditor
    }
  ]
})

export default router

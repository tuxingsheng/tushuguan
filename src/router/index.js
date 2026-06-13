import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/components/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'books',
        name: 'Books',
        component: () => import('@/views/Books.vue')
      },
      {
        path: 'books/add',
        name: 'BookAdd',
        component: () => import('@/views/BookForm.vue')
      },
      {
        path: 'books/:id/edit',
        name: 'BookEdit',
        component: () => import('@/views/BookForm.vue'),
        props: true
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/Members.vue')
      },
      {
        path: 'members/add',
        name: 'MemberAdd',
        component: () => import('@/views/MemberForm.vue')
      },
      {
        path: 'members/:id/edit',
        name: 'MemberEdit',
        component: () => import('@/views/MemberForm.vue'),
        props: true
      },
      {
        path: 'borrowings',
        name: 'Borrowings',
        component: () => import('@/views/Borrowings.vue')
      },
      {
        path: 'borrowings/new',
        name: 'BorrowNew',
        component: () => import('@/views/BorrowForm.vue')
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/Categories.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (to.meta.requiresAuth !== false && !session) {
    next('/login')
  } else if (to.path === '/login' && session) {
    next('/')
  } else {
    next()
  }
})

export default router

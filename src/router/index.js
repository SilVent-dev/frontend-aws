import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('src/pages/DashboardPage.vue'),
        meta: { title: 'Dashboard' }
      },
      {
        path: 's3',
        name: 's3',
        component: () => import('src/pages/S3Page.vue'),
        meta: { title: 'S3 — Armazenamento' }
      },
      {
        path: 'ec2',
        name: 'ec2',
        component: () => import('src/pages/Ec2Page.vue'),
        meta: { title: 'EC2 — Instâncias' }
      },
      {
        path: 'ec2/logs',
        name: 'ec2-logs',
        component: () => import('src/pages/Ec2LogsPage.vue'),
        meta: { title: 'Logs EC2' }
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 })
})

router.beforeEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} | AWS Manager` : 'AWS Manager'
})

export default router

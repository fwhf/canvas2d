import { createRouter, createWebHashHistory } from 'vue-router'
import { menuRouters } from '../util'
let routes = []

const convertComponent = menuRouters => {
  menuRouters.forEach(route => {
    if (route.component) {
      routes.push(route)
    }
    if (route.children) {
      convertComponent(route.children)
    }
  })
}
convertComponent(menuRouters)

routes = routes.concat([
  {
    path: '/:catchAll(.*)',
    redirect: '/'
  }
])

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

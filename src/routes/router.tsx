import { createRouter } from '@tanstack/react-router'
import { routeTree } from './route-tree'

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

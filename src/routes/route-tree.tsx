import {
  createRootRoute,
  createRoute,
  Outlet,
  Link,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'

// Root layout with navigation
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation header */}
      <header className="border-b border-border bg-card px-6 py-3">
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-lg font-bold text-primary">
            天文 V2
          </Link>
          <div className="flex gap-2">
            <NavLink to="/">首頁</NavLink>
            <NavLink to="/preview">Preview</NavLink>
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main>
        <Outlet />
      </main>

      {/* Dev tools — only in development */}
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-primary [&.active]:text-primary-foreground"
    >
      {children}
    </Link>
  )
}

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

// Preview layout route — for component previews during development
const previewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/preview',
  component: PreviewLayout,
})

function PreviewLayout() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Component Preview</h1>
      <Outlet />
    </div>
  )
}

// Preview index — list available previews
const previewIndexRoute = createRoute({
  getParentRoute: () => previewRoute,
  path: '/',
  component: PreviewIndex,
})

function PreviewIndex() {
  return (
    <div className="space-y-2">
      <p className="text-muted-foreground">Select a component to preview:</p>
      <ul className="list-inside list-disc space-y-1">
        <li>
          <Link to="/preview/confirm-modal" className="text-primary underline">
            Confirm Modal
          </Link>{' '}
          (V2-16)
        </li>
      </ul>
    </div>
  )
}

// Placeholder for confirm-modal preview (V2-16 will implement)
const previewConfirmModalRoute = createRoute({
  getParentRoute: () => previewRoute,
  path: '/confirm-modal',
  component: () => (
    <div className="text-muted-foreground">
      Confirm Modal preview — coming in V2-16
    </div>
  ),
})

// Build the route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  previewRoute.addChildren([previewIndexRoute, previewConfirmModalRoute]),
])

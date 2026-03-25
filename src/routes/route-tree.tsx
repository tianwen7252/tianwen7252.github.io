import {
  createRootRoute,
  createRoute,
  Outlet,
  Link,
  useRouterState,
} from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { OrderPage } from '@/pages/order'
import { NotFoundPage } from '@/pages/not-found'
import { ModalPreview, NotifyPreview } from '@/pages/preview'
import { ClockInPage } from '@/pages/clock-in'
import { SettingsPage } from '@/pages/settings'
import { OrdersPage } from '@/pages/orders'
import { SwUpdatePrompt } from '@/components/sw-update-prompt'
import { PageTransition } from '@/components/animations'
import { AppErrorBoundary } from '@/components/app-error-boundary'

// Root layout with navigation
const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

function RootLayout() {
  const { t } = useTranslation()
  // Use pathname as key to trigger re-mount animation on route changes
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation header */}
      <header className="border-b border-border px-6 py-3 bg-[#F8F4EC]">
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-lg font-bold text-primary">
            {t('nav.appTitle')}
          </Link>
          <div className="flex gap-2">
            <NavLink to="/">{t('nav.home')}</NavLink>
            <NavLink to="/orders">{t('nav.orders')}</NavLink>
            <NavLink to="/clock-in">{t('nav.clockIn')}</NavLink>
            <NavLink to="/settings">{t('nav.settings')}</NavLink>
            {import.meta.env.DEV && <NavLink to="/preview">Preview</NavLink>}
          </div>
        </nav>
      </header>

      {/* Page content with global error boundary */}
      <main>
        <AppErrorBoundary title={t('error.appError')}>
          <PageTransition key={pathname}>
            <Outlet />
          </PageTransition>
        </AppErrorBoundary>
      </main>

      {/* SW update prompt */}
      <SwUpdatePrompt />

      {/* Dev tools — only in development */}
      {/* <TanStackRouterDevtools position="bottom-right" /> */}
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
  component: OrderPage,
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
          <Link to="/preview/modal" className="text-primary underline">
            Modal
          </Link>{' '}
          (V2-16)
        </li>
        <li>
          <Link to="/preview/notify" className="text-primary underline">
            Notify
          </Link>{' '}
          (Toast Notifications)
        </li>
      </ul>
    </div>
  )
}

const previewModalRoute = createRoute({
  getParentRoute: () => previewRoute,
  path: '/modal',
  component: ModalPreview,
})

const previewNotifyRoute = createRoute({
  getParentRoute: () => previewRoute,
  path: '/notify',
  component: NotifyPreview,
})

// Clock-in standalone page
const clockInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clock-in',
  component: ClockInPage,
})

// Orders history page
const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrdersPage,
})

// Settings page with tabs (ClockIn, Records, StaffAdmin)
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

// Build the route tree
export const routeTree = rootRoute.addChildren([
  indexRoute,
  ordersRoute,
  clockInRoute,
  settingsRoute,
  previewRoute.addChildren([
    previewIndexRoute,
    previewModalRoute,
    previewNotifyRoute,
  ]),
])

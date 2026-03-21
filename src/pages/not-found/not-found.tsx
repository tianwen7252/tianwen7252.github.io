import { Link } from '@tanstack/react-router'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-lg text-muted-foreground">Page not found</p>
      <Link to="/" className="text-primary underline">
        Back to home
      </Link>
    </div>
  )
}

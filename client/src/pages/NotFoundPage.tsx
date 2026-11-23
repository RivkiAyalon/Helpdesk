import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <Link to="/" className="mt-4 inline-block text-blue-700 underline">
          Back to the home page
        </Link>
      </div>
    </main>
  )
}

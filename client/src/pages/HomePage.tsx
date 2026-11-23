import { useEffect, useState } from 'react'

type HealthResponse = {
  status: string
  database: string
}

type HealthState =
  | { kind: 'loading' }
  | { kind: 'ok'; httpStatus: number; data: HealthResponse }
  | { kind: 'error'; message: string }

export default function HomePage() {
  const [health, setHealth] = useState<HealthState>({ kind: 'loading' })

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/health', { signal: controller.signal })
      .then(async (res) => {
        const data = (await res.json()) as HealthResponse
        setHealth({ kind: 'ok', httpStatus: res.status, data })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message = error instanceof Error ? error.message : String(error)
        setHealth({ kind: 'error', message })
      })

    return () => controller.abort()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Welcome to Helpdesk</h1>
        <p className="mt-2 text-slate-600">
          AI-powered support ticket management.
        </p>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Server status</h2>
          <p className="mt-1 text-sm text-slate-500">GET /api/health</p>
          <div className="mt-4">
            <HealthResult health={health} />
          </div>
        </section>
      </div>
    </main>
  )
}

function HealthResult({ health }: { health: HealthState }) {
  if (health.kind === 'loading') {
    return <p className="text-slate-500">Checking the server…</p>
  }

  if (health.kind === 'error') {
    return (
      <p className="text-red-700">
        Could not reach the server: {health.message}
      </p>
    )
  }

  const healthy = health.httpStatus === 200 && health.data.status === 'ok'

  return (
    <div>
      <p className={healthy ? 'font-medium text-green-700' : 'font-medium text-red-700'}>
        {healthy ? 'Server and database are up' : 'Server is up, but the database is unreachable'}
      </p>
      <pre className="mt-3 overflow-x-auto rounded bg-slate-100 p-3 text-sm">
        {`HTTP ${health.httpStatus}\n${JSON.stringify(health.data, null, 2)}`}
      </pre>
    </div>
  )
}

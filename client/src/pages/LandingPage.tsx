import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'

/**
 * LandingPage Component
 *
 * The public-facing entry point of SyncBoard.
 */
export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <Loader />
  }

  if (isAuthenticated) {
    return <Navigate to="/boards" replace />
  }

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="border-b border-white/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex flex-shrink-0 items-center">
              <span className="brand-mark text-3xl text-blue-600">SyncBoard</span>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="px-3 py-2 text-sm font-semibold tracking-wide text-gray-600 transition-colors hover:text-blue-600"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold tracking-wide text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
            <div className="text-center">
              <p className="brand-kicker mb-5">Live ideas. Shared momentum.</p>
              <h1 className="hero-display mb-8 text-5xl sm:text-7xl">
                Collaborate in <span className="text-blue-600">Real-Time</span>
                <br />
                on a Shared Infinite Canvas
              </h1>
              <p className="section-copy mx-auto mb-10 max-w-3xl text-lg sm:text-xl">
                <span className="brand-mark mr-2 inline-block text-xl text-blue-600">SyncBoard</span>
                brings your team together. Sketch ideas, organize thoughts with sticky notes,
                and build something amazing in a synchronized, persistent environment.
              </p>
              <div className="flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-8 py-3 text-base font-semibold tracking-wide text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700 md:px-10 md:py-4 md:text-lg"
                >
                  Start Creating Now
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-blue-100 bg-white/90 px-8 py-3 text-base font-semibold tracking-wide text-gray-700 shadow-sm transition hover:bg-gray-50 md:px-10 md:py-4 md:text-lg"
                >
                  Live Demo
                </Link>
              </div>
            </div>
          </div>

          <div className="py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                <div className="paper-card rounded-[2rem] p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="panel-title mb-3 text-xl text-gray-900">Instant Sync</h3>
                  <p className="section-copy text-base">
                    Powered by Y.js, experience sub-millisecond synchronization across all connected clients.
                  </p>
                </div>

                <div className="paper-card rounded-[2rem] p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="panel-title mb-3 text-xl text-gray-900">Team Presence</h3>
                  <p className="section-copy text-base">
                    See who&apos;s working with real-time cursors and status indicators for every collaborator.
                  </p>
                </div>

                <div className="paper-card rounded-[2rem] p-8">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                    <svg className="h-6 w-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="panel-title mb-3 text-xl text-gray-900">Persistent Notes</h3>
                  <p className="section-copy text-base">
                    Your ideas stay safe. Every stroke and note is carried forward with durable persistence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/60 bg-white/60 py-12 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="stat-label text-sm text-gray-500">© 2026 SyncBoard. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

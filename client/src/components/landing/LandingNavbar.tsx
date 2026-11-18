import { Link } from 'react-router-dom'

interface LandingNavbarProps {
  isAuthenticated: boolean
  userName?: string
  demoLoading: boolean
  onDemoLogin: () => void
  onHomeClick: () => void
}

export function LandingNavbar({
  isAuthenticated,
  userName,
  demoLoading,
  onDemoLogin,
  onHomeClick,
}: LandingNavbarProps) {
  return (
    <nav className="relative z-20 border-b border-white/50 bg-white/42 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onHomeClick}
          className="group flex min-w-0 items-center space-x-3 text-left transition hover:opacity-90 focus:outline-none"
          title="SyncBoard Home"
        >
          <img
            src="/favicon.png"
            alt="SyncBoard Logo"
            className="h-8 w-8 object-contain transition-transform duration-200 group-hover:scale-110 sm:h-9 sm:w-9"
          />
          <span
            className="navbar-brand text-2xl font-bold tracking-tight text-blue-600 transition-colors group-hover:text-blue-700 sm:text-3xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            SyncBoard
          </span>
        </button>

        {isAuthenticated ? (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {userName && (
              <span className="hidden sm:inline-block rounded-full border border-slate-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-md">
                {userName}
              </span>
            )}
            <Link
              to="/boards"
              className="rounded-full bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-700 sm:px-5"
            >
              Go to Boards &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onDemoLogin}
              disabled={demoLoading}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/90 bg-blue-50/80 px-3.5 py-2 text-xs sm:text-sm font-semibold tracking-wide text-blue-700 backdrop-blur-md transition hover:bg-blue-100 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
              </span>
              {demoLoading ? 'Starting...' : 'Try Demo User'}
            </button>
            <Link
              to="/login"
              className="rounded-full px-3 py-2 text-xs sm:text-sm font-semibold tracking-wide text-slate-600 transition-colors hover:text-blue-600 sm:px-4"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:bg-blue-700 sm:px-5"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

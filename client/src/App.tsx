import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from './components/AuthGuard'
import { ToastProvider } from './components/ToastProvider'
import { AuthProvider } from './context/AuthContext'
import Loader from './components/Loader'
import { CinematicPreloader } from './components/CinematicPreloader'

// Lazy load page components
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })))
const BoardList = lazy(() => import('./pages/BoardList').then(module => ({ default: module.BoardList })))
const BoardView = lazy(() => import('./pages/BoardView').then(module => ({ default: module.BoardView })))
const JoinBoard = lazy(() => import('./pages/JoinBoard').then(module => ({ default: module.JoinBoard })))

function RouteReadySignal({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    let rafId = requestAnimationFrame(() => {
      onReady()
    })
    return () => cancelAnimationFrame(rafId)
  }, [onReady])

  return null
}

/**
 * Main App Component
 * 
 * Sets up application providers, routing, and global layout.
 */
function App() {
  const [showPreloader, setShowPreloader] = useState(true)
  const [routeMounted, setRouteMounted] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const [minDelayElapsed, setMinDelayElapsed] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMinDelayElapsed(true)
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    let cancelled = false

    const waitForWindowLoad = () =>
      new Promise<void>((resolve) => {
        if (document.readyState === 'complete') {
          resolve()
          return
        }
        const handleLoad = () => {
          window.removeEventListener('load', handleLoad)
          resolve()
        }
        window.addEventListener('load', handleLoad, { once: true })
      })

    const waitForFonts = () =>
      document.fonts && typeof document.fonts.ready?.then === 'function'
        ? document.fonts.ready.then(() => undefined).catch(() => undefined)
        : Promise.resolve()

    Promise.all([waitForWindowLoad(), waitForFonts()]).then(() => {
      if (!cancelled) {
        setAssetsReady(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const isAppReady = assetsReady && routeMounted && minDelayElapsed

  return (
    <AuthProvider>
      <ToastProvider>
        {showPreloader && (
          <CinematicPreloader
            isReady={isAppReady}
            onComplete={() => setShowPreloader(false)}
          />
        )}
        <BrowserRouter>
          <Suspense fallback={showPreloader ? null : <Loader />}>
            <RouteReadySignal onReady={() => setRouteMounted(true)} />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/join/:boardId" element={<JoinBoard />} />

              {/* Protected Routes */}
              <Route element={<AuthGuard />}>
                <Route path="/boards" element={<BoardList />} />
                <Route path="/board/:boardId" element={<BoardView />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App


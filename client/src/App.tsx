import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from './components/AuthGuard'
import { ToastProvider } from './components/ToastProvider'
import { AuthProvider } from './context/AuthContext'
import Loader from './components/Loader'

// Lazy load page components
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({ default: module.RegisterPage })))
const BoardList = lazy(() => import('./pages/BoardList').then(module => ({ default: module.BoardList })))
const BoardView = lazy(() => import('./pages/BoardView').then(module => ({ default: module.BoardView })))
const JoinBoard = lazy(() => import('./pages/JoinBoard').then(module => ({ default: module.JoinBoard })))

/**
 * Main App Component
 * 
 * Sets up application providers, routing, and global layout.
 */
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Suspense fallback={<Loader />}>
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


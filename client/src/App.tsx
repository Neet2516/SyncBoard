import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { BoardList } from './pages/BoardList'
import { BoardView } from './pages/BoardView'
import { JoinBoard } from './pages/JoinBoard'
import { AuthGuard } from './components/AuthGuard'
import { ToastProvider } from './components/ToastProvider'
import { AuthProvider } from './context/AuthContext'

/**
 * Main App Component
 * 
 * Configures the application routing and authentication guards.
 */
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App


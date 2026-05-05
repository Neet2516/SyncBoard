import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { BoardList } from './pages/BoardList'
import { BoardView } from './pages/BoardView'
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
            {/* Unauthenticated Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<AuthGuard />}>
              <Route path="/boards" element={<BoardList />} />
              <Route path="/board/:boardId" element={<BoardView />} />
              <Route path="/" element={<Navigate to="/boards" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/boards" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App


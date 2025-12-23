import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import Header from './components/Header'
import LandingPage from './pages/LandingPage'
import StudioLanding from './pages/StudioLanding'
import CreateAlbumPage from './pages/CreateAlbumPage'
import EnhancedAlbumPage from './pages/EnhancedAlbumPage'
import EnhancedRecentAlbums from './pages/EnhancedRecentAlbums'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EditAlbumPage from './pages/EditAlbumPage'
import StudioManagementPage from './pages/StudioManagementPage'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { applyTheme, removeTheme } from './themes/categories'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="font-sans" style={{ color: 'var(--text-soft)' }}>
          Loading...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default function App() {
  const [dark, setDark] = useState(false)
  const location = useLocation()
  const isAlbumPage = location.pathname.startsWith('/albums/')

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDark(isDark)
    
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    if (shouldBeDark !== isDark) {
      toggleTheme()
    }
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    const root = document.documentElement
    root.classList.toggle('dark', next)
    root.setAttribute('data-theme', next ? 'dark' : 'light')
    
    // Apply enhanced theme system
    const currentPath = location.pathname
    if (currentPath.startsWith('/albums/')) {
      // Extract category from album page if available
      // This would need to be enhanced based on your album data structure
      removeTheme() // For now, just remove theme on toggle
    }
    
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch { void 0 }
  }

  return (
    <AuthProvider>
      <AppContent dark={dark} toggleTheme={toggleTheme} isAlbumPage={isAlbumPage} />
    </AuthProvider>
  )
}

function AppContent({ dark, toggleTheme, isAlbumPage }) {
  const location = useLocation()
  const isStudioLanding = location.pathname === '/'
  
  return (
    <div className={`min-h-screen ${isStudioLanding ? 'bg-slate-950' : 'gradient-bg'}`} style={{ color: isStudioLanding ? '#f1f5f9' : 'var(--text)' }}>
      {!isAlbumPage && !isStudioLanding && (
        <Header dark={dark} toggleTheme={toggleTheme} />
      )}

      {isAlbumPage && (
        <button
          aria-label="Toggle theme"
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
          style={{
            background: 'transparent',
            color: 'var(--text)',
            boxShadow: 'none'
          }}
        >
          {dark ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
        </button>
      )}

      <main className={isAlbumPage || isStudioLanding ? "" : "max-w-7xl mx-auto px-4 md:px-6 pb-20 pt-6 md:pt-8"}>
        <Routes>
          <Route path="/" element={<StudioLanding />} />
          <Route path="/albums-app" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<ProtectedRoute><RegisterPage /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateAlbumPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/studio-management" element={<ProtectedRoute><StudioManagementPage /></ProtectedRoute>} />
          <Route path="/edit/:slug" element={<ProtectedRoute><EditAlbumPage /></ProtectedRoute>} />
          <Route path="/albums/:slug" element={<EnhancedAlbumPage />} />
          <Route path="/recent_albums" element={<ProtectedRoute><EnhancedRecentAlbums /></ProtectedRoute>} />
        </Routes>
      </main>
      
      {!isAlbumPage && !isStudioLanding && (
        <footer className="border-t pb-20 md:pb-0" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 md:py-12">
            <div className="flex flex-col items-center gap-4 md:gap-6 text-center md:text-left md:flex-row md:justify-between">
              <div className="flex items-center gap-2 font-serif text-base md:text-lg" style={{ color: 'var(--text)' }}>
                <Heart className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--accent)' }} />
                <span>Made with love</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 text-xs md:text-sm font-sans" style={{ color: 'var(--text-soft)' }}>
                <span>© {new Date().getFullYear()} Robel Studio</span>
                <div className="flex items-center gap-4 md:gap-6">
                  <a className="hover:opacity-70 transition-opacity" href="#">Privacy</a>
                  <a className="hover:opacity-70 transition-opacity" href="#">Terms</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

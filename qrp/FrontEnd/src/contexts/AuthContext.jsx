import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, getUserProfile, refreshToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token')
    if (token) {
      getUserProfile()
        .then(userData => {
          setUser(userData)
        })
        .catch(() => {
          // Token might be expired, try to refresh
          const refresh = localStorage.getItem('refresh_token')
          if (refresh) {
            refreshToken(refresh)
              .then(data => {
                localStorage.setItem('access_token', data.access)
                return getUserProfile()
              })
              .then(userData => {
                setUser(userData)
              })
              .catch(() => {
                // Refresh failed, clear tokens
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
              })
          }
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const data = await apiLogin(credentials)
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    setUser(data.user)
    return data
  }

  const register = async (userData) => {
    const data = await apiRegister(userData)
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

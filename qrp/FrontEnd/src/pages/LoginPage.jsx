import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center px-4 py-6"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Welcome Back
          </h1>
          <p className="font-sans text-base" style={{ color: 'var(--text-soft)' }}>
            Sign in to manage your albums
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium font-sans mb-1.5" style={{ color: 'var(--text)' }}>
              Username
            </label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2.5 text-base font-sans rounded-lg border-2"
              placeholder="Enter your username"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans mb-1.5" style={{ color: 'var(--text)' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 pr-12 text-base font-sans rounded-lg border-2"
                placeholder="Enter your password"
                style={{ borderColor: 'var(--border)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 mt-2"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="spinner" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <LogIn className="w-5 h-5" />
                Sign In
              </span>
            )}
          </button>

          <p className="text-center text-sm pt-2" style={{ color: 'var(--text-soft)' }}>
            Contact your administrator for account access
          </p>
        </form>
      </div>
    </div>
  )
}

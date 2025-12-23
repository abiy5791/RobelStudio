import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { register, user } = useAuth()
  const navigate = useNavigate()

  // Check if user is admin
  if (user && !user.is_admin) {
    toast.error('Only administrators can register new users')
    navigate('/dashboard')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('User account created successfully!')
      // Clear form after successful registration
      setForm({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
      })
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center px-4 py-6"
    >
      <div className="w-full max-w-3xl">
        <div className="text-center mb-6">
          <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Register New User
          </h1>
          <p className="font-sans text-base" style={{ color: 'var(--text-soft)' }}>
            Create a new user account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium font-sans mb-1.5" style={{ color: 'var(--text)' }}>
                First Name
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full px-4 py-2.5 text-base font-sans rounded-lg border-2"
                placeholder="John"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium font-sans mb-1.5" style={{ color: 'var(--text)' }}>
                Last Name
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full px-4 py-2.5 text-base font-sans rounded-lg border-2"
                placeholder="Doe"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
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
                placeholder="johndoe"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium font-sans mb-1.5" style={{ color: 'var(--text)' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 text-base font-sans rounded-lg border-2"
                placeholder="john@example.com"
                style={{ borderColor: 'var(--border)' }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium font-sans mb-1.5" style={{ color: 'var(--text)' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-12 text-base font-sans rounded-lg border-2"
                  placeholder="At least 8 characters"
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 mt-5"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="spinner" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <UserPlus className="w-5 h-5" />
                Create User Account
              </span>
            )}
          </button>

          <p className="text-center text-sm pt-3" style={{ color: 'var(--text-soft)' }}>
            The new user will receive their credentials to login
          </p>
        </form>
      </div>
    </div>
  )
}

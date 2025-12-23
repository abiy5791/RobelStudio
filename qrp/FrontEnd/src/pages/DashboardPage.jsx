import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Plus, Edit, Trash2, Eye, Download, Calendar, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getMyAlbums, deleteAlbum } from '../services/api'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 12
  const navigate = useNavigate()

  useEffect(() => {
    loadAlbums()
  }, [currentPage])

  const loadAlbums = async () => {
    try {
      const data = await getMyAlbums(currentPage, itemsPerPage)
      if (data.results) {
        setAlbums(data.results)
        setTotalCount(data.count || 0)
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
      } else {
        setAlbums(data || [])
      }
    } catch (err) {
      toast.error('Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slug, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteAlbum(slug)
      toast.success('Album deleted successfully')
      setAlbums(albums.filter(a => a.slug !== slug))
    } catch (err) {
      toast.error('Failed to delete album')
    }
  }

  const downloadQR = (albumUrl, albumName) => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256

    import('qrcode').then((QRCode) => {
      QRCode.toCanvas(canvas, albumUrl, { width: 256, margin: 2 }, (error) => {
        if (error) {
          toast.error('Failed to generate QR code')
          return
        }
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png', 1.0)
        link.download = `${albumName || 'album'}-qr-code.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('QR code downloaded!')
      })
    })
  }

  return (
    <motion.div
      className="py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            My Albums
          </h1>
          <p className="font-sans text-base" style={{ color: 'var(--text-soft)' }}>
            Welcome back, {user?.first_name || user?.username}!
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/create" 
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Album</span>
            <span className="sm:hidden">Create</span>
          </Link>
          <button 
            onClick={logout} 
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      {!loading && albums.length > 0 && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-soft)' }}
            />
            <input
              type="text"
              placeholder="Search albums by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 font-sans text-base transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-6 py-3 rounded-xl border-2 font-sans text-base transition-all duration-300 focus:outline-none focus:ring-2 min-w-48"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <option value="all">All Categories</option>
            <option value="weddings">Weddings</option>
            <option value="family">Family</option>
            <option value="celebrations">Celebrations</option>
            <option value="travel">Travel</option>
            <option value="special">Special</option>
            <option value="personal">Personal</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="aspect-[4/3] skeleton rounded-lg mb-4" />
              <div className="w-32 h-4 skeleton mb-2 rounded" />
              <div className="w-20 h-3 skeleton rounded" />
            </div>
          ))}
        </div>
      ) : albums.length === 0 ? (
        <motion.div
          className="card text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: 'var(--accent)' }} />
          <h3 className="font-serif text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            No albums yet
          </h3>
          <p className="font-sans mb-6" style={{ color: 'var(--text-soft)' }}>
            Create your first album to get started
          </p>
          <Link 
            to="/create" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
          >
            <Plus className="w-5 h-5" />
            Create Your First Album
          </Link>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums
            .filter((album) => {
              const matchesSearch = album.names
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
              const matchesCategory =
                filterCategory === 'all' || album.category === filterCategory
              return matchesSearch && matchesCategory
            })
            .map((album, i) => (
            <motion.div
              key={album.slug}
              className="card group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              {/* Album Cover */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-4">
                {album.cover_photo || album.photos?.[0] ? (
                  <img
                    src={
                      album.cover_photo?.thumbnail_url || 
                      album.cover_photo?.url || 
                      (typeof album.photos?.[0] === 'string' ? album.photos[0] : (album.photos[0]?.thumbnail_url || album.photos[0]?.url))
                    }
                    alt={album.names}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--surface-soft)' }}>
                    <Heart className="w-12 h-12" style={{ color: 'var(--accent)' }} />
                  </div>
                )}
                {/* Action buttons - visible on mobile, hover on desktop */}
                <div className="absolute inset-0 bg-black/50 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link
                    to={`/albums/${album.slug}`}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                    title="View Album"
                  >
                    <Eye className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </Link>
                  <Link
                    to={`/edit/${album.slug}`}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                    title="Edit Album"
                  >
                    <Edit className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </Link>
                  <button
                    onClick={() => downloadQR(album.url, album.names)}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
                    title="Download QR Code"
                  >
                    <Download className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </button>
                  <button
                    onClick={() => handleDelete(album.slug, album.names)}
                    className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center hover:scale-110 transition-transform"
                    title="Delete Album"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Album Info */}
              <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {album.names}
              </h3>
              <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-soft)' }}>
                <Calendar className="w-4 h-4" />
                {new Date(album.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span style={{ color: 'var(--text-soft)' }}>
                  {album.photo_count || album.photos?.length || 0} photos
                </span>
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'var(--blush)',
                    color: 'var(--accent)',
                  }}
                >
                  {album.category}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && albums.length > 0 && totalPages > 1 && (
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Mobile: Compact view */}
          <div className="flex sm:hidden items-center gap-2 w-full max-w-sm">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1 text-center px-3 py-2 rounded-lg font-medium" style={{
              background: 'var(--surface)',
              color: 'var(--text)',
            }}>
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop: Full view */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden md:inline">Previous</span>
            </button>
            
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9 h-9 rounded-lg font-medium transition-all duration-300"
                    style={{
                      background: currentPage === pageNum ? 'var(--accent)' : 'var(--surface)',
                      color: currentPage === pageNum ? 'white' : 'var(--text)',
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

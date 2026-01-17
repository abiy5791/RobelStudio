import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeCanvas } from 'qrcode.react'
import { Heart, Calendar, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { listAlbums } from '../services/api.js'
import { getImageUrl } from '../utils/imageUtils.js'
import { getTheme, getCategoryIcon } from '../themes/categories'
import CategorySelector from '../components/CategorySelector'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'

export default function EnhancedRecentAlbums() {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 20

  const filteredAlbums = selectedCategory === 'all' 
    ? albums 
    : albums.filter(album => album.category === selectedCategory)

  useEffect(() => {
    let active = true
    setLoading(true)
    listAlbums(currentPage, itemsPerPage)
      .then((data) => { 
        if (active) {
          if (data.results) {
            setAlbums(data.results)
            setTotalCount(data.count || 0)
            setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
          } else {
            setAlbums(data || [])
            setTotalPages(1)
          }
        }
      })
      .catch((e) => { if (active) setError(e.message || 'Failed to load albums') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [currentPage])

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const downloadCard = async (album) => {
    try {
      const element = document.getElementById(`thank-you-card-${album.id}`);
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
      });
      
      const link = document.createElement('a');
      link.download = `thank-you-card-${album?.names?.replace(/[^a-zA-Z0-9]/g, '-') || 'album'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success('Thank you card downloaded!');
    } catch (error) {
      console.error('Failed to download card:', error);
      toast.error('Failed to download card');
    }
  };

  return (
    <motion.section 
      className="py-6 md:py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div>
          <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            Album Gallery
          </h1>
          <p className="font-sans text-base md:text-lg mb-6" style={{ color: 'var(--text-soft)' }}>
            Beautiful moments captured across all categories
          </p>
          
          <CategorySelector 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            className="mb-6"
          />
        </div>
        
        {!loading && !error ? (
          <div className="flex flex-col gap-2">
            <span className="font-sans text-sm px-4 py-2 rounded-full" style={{ 
              color: 'var(--text-soft)',
              background: 'var(--blush)'
            }}>
              {totalCount > 0 ? totalCount : filteredAlbums.length} beautiful {(totalCount > 0 ? totalCount : filteredAlbums.length) === 1 ? 'album' : 'albums'}
              {selectedCategory !== 'all' && ` in ${getTheme(selectedCategory).name}`}
            </span>
          </div>
        ) : null}
      </motion.div>

      {error ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="font-sans text-rose-600">{error}</p>
        </motion.div>
      ) : null}

      {(!loading && !error && filteredAlbums.length === 0 && selectedCategory !== 'all') ? (
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div 
            className="max-w-md mx-auto p-12 rounded-3xl"
            style={{ background: 'var(--surface-soft)' }}
          >
            <span className="text-6xl mb-6 block">{getCategoryIcon(selectedCategory)}</span>
            <h3 className="font-serif text-2xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
              No {getTheme(selectedCategory).name} Albums Yet
            </h3>
            <p className="font-sans mb-8" style={{ color: 'var(--text-soft)' }}>
              Be the first to create a beautiful album in this category
            </p>
            <Link to="/create" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create First Album
            </Link>
          </div>
        </motion.div>
      ) : (!loading && !error && albums.length === 0) ? (
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div 
            className="max-w-md mx-auto p-12 rounded-3xl"
            style={{ background: 'var(--surface-soft)' }}
          >
            <Heart className="w-16 h-16 mx-auto mb-6" style={{ color: 'var(--accent)' }} />
            <h3 className="font-serif text-2xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
              Your First Album Awaits
            </h3>
            <p className="font-sans mb-8" style={{ color: 'var(--text-soft)' }}>
              Create your first beautiful album and share it with the world
            </p>
            <Link to="/create" className="btn-primary inline-flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Create Your First Album
            </Link>
          </div>
        </motion.div>
      ) : null}

      <motion.div 
        className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <motion.div key={i} className="postcard-skeleton" variants={itemVariants}>
              <div className="w-full h-64 skeleton rounded-2xl" />
            </motion.div>
          ))
        ) : (
          filteredAlbums.map((a, i) => {
            const theme = getTheme(a.category || 'weddings');
            
            return (
              <motion.div key={i} variants={itemVariants}>
                <div className="relative group">
                  <div 
                    id={`thank-you-card-${a.id}`}
                    className="postcard-container"
                    style={{
                      // background: theme.colors.background,
                    }}
                  >
                    <div 
                      className="postcard"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.primary}20 100%)`,
                        borderColor: theme.colors.primary,
                      }}
                    >
                      {/* Left side - Featured photo */}
                      <div className="postcard-photo">
                        {a.cover_photo || a.photos?.[0] ? (
                          <img 
                            src={getImageUrl(
                              a.cover_photo?.medium_url || 
                              a.cover_photo?.url || 
                              (typeof a.photos?.[0] === 'string' ? a.photos[0] : (a.photos[0]?.medium_url || a.photos[0]?.url))
                            )} 
                            alt={`${a.names} album`} 
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: theme.colors.background }}
                          >
                            <span className="text-6xl opacity-60">{getCategoryIcon(a.category)}</span>
                          </div>
                        )}
                      </div>

                      {/* Right side - Thank you message */}
                      <div 
                        className="postcard-content"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, ${theme.colors.primary}10 100%)`
                        }}
                      >
                        <div className="relative h-full flex flex-col">
                          {/* Category badge */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{getCategoryIcon(a.category)}</span>
                            <span 
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={{
                                background: theme.colors.primary + '20',
                                color: theme.colors.text
                              }}
                            >
                              {theme.name}
                            </span>
                          </div>
                          
                          {/* Thank You title */}
                          <div className="mb-4">
                            <h2 
                              className="text-2xl md:text-4xl lg:text-5xl font-semibold mb-2"
                              style={{ 
                                color: theme.colors.text,
                                fontFamily: theme.fonts.display
                              }}
                            >
                              Thank You
                            </h2>
                          </div>

                          {/* Message */}
                          <div className="flex-1 mb-6">
                            <p 
                              className="postcard-message"
                              style={{
                                color: theme.colors.text,
                                fontFamily: theme.fonts.serif
                              }}
                            >
                              {a.category === 'weddings' 
                                ? "For being here on our wedding day, you helped make it truly unforgettable for us. We hope you enjoyed it as much as we did."
                                : a.category === 'family'
                                ? "Thank you for being part of our family's special moments. Your presence made these memories even more precious."
                                : a.category === 'celebrations'
                                ? "Thanks for celebrating with us! Your energy and joy made this party absolutely amazing."
                                : a.category === 'travel'
                                ? "Thank you for following our adventure! These memories wouldn't be the same without sharing them with you."
                                : a.category === 'special'
                                ? "Thank you for making this special occasion even more memorable. Your presence meant the world to us."
                                : "Thank you for being part of our creative journey. Your support and encouragement inspire us every day."
                              }
                            </p>
                          </div>

                          {/* Signature and QR */}
                          <div className="flex items-end justify-between">
                            <div>
                              <p 
                                className="postcard-signature"
                                style={{
                                  color: theme.colors.text,
                                  fontFamily: theme.fonts.display
                                }}
                              >
                                {a.names}
                              </p>
                              <div className="flex items-center gap-1 text-xs mt-1" style={{ color: theme.colors.text + '70' }}>
                                <Calendar className="w-3 h-3" />
                                {new Date(a.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                            <div 
                              className="qr-code-enhanced"
                              style={{
                                background: `linear-gradient(135deg, ${theme.colors.secondary} 0%, white 100%)`,
                                borderColor: theme.colors.primary
                              }}
                            >
                              <QRCodeCanvas value={a.url} size={64} includeMargin={false} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Download Icon - positioned over the card */}
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      downloadCard(a);
                    }}
                    className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-sm"
                    style={{
                      background: theme.colors.primary + '90',
                      color: 'white'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Download Thank You Card"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                  
                  {/* Link to album - covers the entire card except download button */}
                  <Link 
                    to={a.url} 
                    className="absolute inset-0 z-0"
                    aria-label={`View ${a.names} album`}
                  />
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Pagination - only show when not filtering by category */}
      {!loading && !error && albums.length > 0 && totalPages > 1 && selectedCategory === 'all' && (
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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
      
      {/* Category selector styles */}
      <style jsx>{`
        .category-selector {
          margin-bottom: 2rem;
        }
        
        .category-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          border: 2px solid;
        }
        
        .category-pill.selected {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .category-icon {
          font-size: 1.2em;
        }
        
        .category-name {
          white-space: nowrap;
        }
        
        @media (max-width: 768px) {
          .category-pill {
            padding: 0.5rem 1rem;
            font-size: 0.75rem;
          }
          
          .category-name {
            display: none;
          }
        }
      `}</style>
    </motion.section>
  )
}
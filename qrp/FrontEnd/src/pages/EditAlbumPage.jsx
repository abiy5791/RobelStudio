import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Save, ArrowLeft, Upload, X, GripVertical } from 'lucide-react'
import { getAlbum, updateAlbum, uploadImagesToBackend } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import CategorySelector from '../components/CategorySelector'

export default function EditAlbumPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    names: '',
    date: '',
    description: '',
    category: 'weddings',
    allow_downloads: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [album, setAlbum] = useState(null)
  const [photos, setPhotos] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadAlbum()
  }, [slug])

  const loadAlbum = async () => {
    try {
      const data = await getAlbum(slug)
      
      // Check if user is the owner
      if (!data.is_owner) {
        toast.error('You do not have permission to edit this album')
        navigate('/dashboard')
        return
      }

      setAlbum(data)
      setForm({
        names: data.names,
        date: data.date,
        description: data.description || '',
        category: data.category,
        allow_downloads: data.allow_downloads,
      })
      // Keep full photo objects to preserve thumbnail and medium URLs
      setPhotos(data.photos || [])
    } catch (err) {
      toast.error('Failed to load album')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setUploadProgress(0)
    try {
      let finalPhotos = [...photos]
      
      // Upload new files if any
      if (newFiles.length > 0) {
        setUploading(true)
        const uploadedUrls = await uploadImagesToBackend(newFiles, (progress) => {
          setUploadProgress(Math.min(progress, 90))
        })
        finalPhotos = [...finalPhotos, ...uploadedUrls]
        setUploadProgress(95)
        setUploading(false)
      }
      
      // Update album with new photo order
      const updateData = {
        ...form,
        photos: finalPhotos
      }
      
      await updateAlbum(slug, updateData)
      setUploadProgress(100)
      toast.success('Album updated successfully!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Failed to update album')
    } finally {
      setSaving(false)
      setUploading(false)
      setTimeout(() => setUploadProgress(0), 1000)
    }
  }
  
  const handleAddPhotos = (e) => {
    const files = Array.from(e.target.files || [])
    setNewFiles(prev => [...prev, ...files])
  }
  
  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }
  
  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
  }
  
  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }
  
  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newPhotos = [...photos]
    const draggedPhoto = newPhotos[draggedIndex]
    newPhotos.splice(draggedIndex, 1)
    newPhotos.splice(index, 0, draggedPhoto)
    
    setPhotos(newPhotos)
    setDraggedIndex(index)
  }
  
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }
  
  const handleTouchStart = (index) => {
    setDraggedIndex(index)
  }
  
  const handleTouchMove = (e) => {
    if (draggedIndex === null) return
    e.preventDefault()
  }
  
  const handleTouchEnd = () => {
    setDraggedIndex(null)
  }
  
  const movePhoto = (fromIndex, direction) => {
    const toIndex = fromIndex + direction
    if (toIndex < 0 || toIndex >= photos.length) return
    
    const newPhotos = [...photos]
    const temp = newPhotos[fromIndex]
    newPhotos[fromIndex] = newPhotos[toIndex]
    newPhotos[toIndex] = temp
    setPhotos(newPhotos)
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="font-sans" style={{ color: 'var(--text-soft)' }}>
          Loading album...
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="btn-ghost mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
            Edit Album
          </h1>
          <p className="font-sans text-base" style={{ color: 'var(--text-soft)' }}>
            Update your album details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <label className="block text-sm font-medium font-sans mb-3" style={{ color: 'var(--text)' }}>
              Album Category
            </label>
            <CategorySelector
              selectedCategory={form.category}
              onCategoryChange={(category) => setForm({ ...form, category })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans mb-3" style={{ color: 'var(--text)' }}>
              <Heart className="inline w-4 h-4 mr-2" style={{ color: 'var(--accent)' }} />
              {form.category === 'weddings' ? "Couple's Names" : 'Album Name'}
            </label>
            <input
              type="text"
              required
              value={form.names}
              onChange={(e) => setForm({ ...form, names: e.target.value })}
              className="w-full px-4 py-3 text-base font-serif"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans mb-3" style={{ color: 'var(--text)' }}>
              Date
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 font-sans"
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-sans mb-3" style={{ color: 'var(--text)' }}>
              Description
            </label>
            <textarea
              rows="5"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 font-sans resize-none"
              placeholder="Share your story..."
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allow_downloads}
                onChange={(e) => setForm({ ...form, allow_downloads: e.target.checked })}
                className="w-5 h-5 rounded border-2 cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
              <span className="font-sans text-sm" style={{ color: 'var(--text)' }}>
                Allow guests to download photos
              </span>
            </label>
          </div>

          {/* Photo Management Section */}
          <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
            <label className="block text-sm font-medium font-sans mb-3" style={{ color: 'var(--text)' }}>
              <Upload className="inline w-4 h-4 mr-2" style={{ color: 'var(--accent)' }} />
              Manage Photos
            </label>
            
            {/* Current Photos */}
            {photos.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-sans mb-2" style={{ color: 'var(--text-soft)' }}>
                  Drag to reorder • {photos.length} photo{photos.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onTouchStart={() => handleTouchStart(index)}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      className="relative group cursor-move"
                      style={{ opacity: draggedIndex === index ? 0.5 : 1 }}
                    >
                      <img
                        src={typeof photo === 'string' ? photo : (photo.thumbnail_url || photo.url)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical size={16} className="text-white drop-shadow" />
                      </div>
                      {/* Mobile reorder buttons */}
                      <div className="md:hidden absolute bottom-1 left-1 flex gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => movePhoto(index, -1)}
                            className="w-6 h-6 rounded bg-black/70 text-white text-xs flex items-center justify-center"
                          >
                            ←
                          </button>
                        )}
                        {index < photos.length - 1 && (
                          <button
                            type="button"
                            onClick={() => movePhoto(index, 1)}
                            className="w-6 h-6 rounded bg-black/70 text-white text-xs flex items-center justify-center"
                          >
                            →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Photos to Add */}
            {newFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-sans mb-2" style={{ color: 'var(--text-soft)' }}>
                  New Photos to Add
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {newFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewFile(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                        NEW
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Photos Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleAddPhotos}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed rounded-lg p-4 text-center transition-colors hover:border-accent"
              style={{ borderColor: 'var(--border)' }}
            >
              <Upload className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
              <p className="text-sm font-sans" style={{ color: 'var(--text)' }}>
                Add More Photos
              </p>
              <p className="text-xs font-sans mt-1" style={{ color: 'var(--text-soft)' }}>
                Click to browse or drag and drop
              </p>
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              {(uploading || saving) && uploadProgress > 0 && (
                <div
                  className="absolute inset-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              )}
              {uploading ? (
                <span className="flex items-center gap-2 relative z-10">
                  <div className="spinner" />
                  {uploadProgress > 0 && uploadProgress < 100
                    ? `Uploading... ${uploadProgress}%`
                    : "Uploading photos..."}
                </span>
              ) : saving ? (
                <span className="flex items-center gap-2 relative z-10">
                  <div className="spinner" />
                  {uploadProgress === 100 ? "Finalizing..." : "Saving..."}
                </span>
              ) : (
                <span className="flex items-center gap-2 relative z-10">
                  <Save className="w-5 h-5" />
                  Save Changes
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
              style={{
                background: 'var(--accent)',
                color: 'white',
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-8 p-4 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-sm font-sans" style={{ color: 'var(--text-soft)' }}>
            <strong>Note:</strong> You cannot edit photos after album creation. To change photos, you'll need to create a new album.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

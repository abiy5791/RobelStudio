import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, FileText, Briefcase, MessageSquare, 
  FolderOpen, Image, Plus, Edit, Trash2, Upload,
  Save, X, Eye, GripVertical
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import MultipleImageUpload from '../components/MultipleImageUpload'
import { formatNumber } from '../utils/numberUtils'
import toast from 'react-hot-toast'
import {
  getStudioContent, updateStudioContent,
  getStudioStats, createStudioStat, updateStudioStat, deleteStudioStat,
  getServices, createService, updateService, deleteService,
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
  getPortfolioCategories, createPortfolioCategory, updatePortfolioCategory, deletePortfolioCategory,
  getPortfolioImages, deletePortfolioImage,
  getServiceGalleryImages, deleteServiceGalleryImage,
  bulkUploadPortfolioImages, bulkUploadServiceImages,
  getMediaItems, createMediaItem, deleteMediaItem, updateMediaItem
} from '../services/studioManagementApi'

export default function StudioManagementPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('content')
  const [loading, setLoading] = useState(false)

  // Content state
  const [content, setContent] = useState({
    hero_title: '',
    hero_subtitle: '',
    about_title: '',
    about_text: ''
  })

  // Stats state
  const [stats, setStats] = useState([])
  const [editingStat, setEditingStat] = useState(null)
  const [statForm, setStatForm] = useState({ label: '', value: '', icon: 'FiUsers', order: 0, is_active: true })

  // Services state
  const [services, setServices] = useState([])
  const [editingService, setEditingService] = useState(null)
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', icon: 'FiCamera', is_active: true })

  // Testimonials state
  const [testimonials, setTestimonials] = useState([])
  const [editingTestimonial, setEditingTestimonial] = useState(null)
  const [testimonialForm, setTestimonialForm] = useState({ name: '', role: '', quote: '', avatar: null, is_active: true })

  // Portfolio state
  const [categories, setCategories] = useState([])
  const [portfolioImages, setPortfolioImages] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', is_active: true })

  // Service gallery state
  const [serviceGalleryImages, setServiceGalleryImages] = useState([])
  const [selectedService, setSelectedService] = useState(null)

  // Media items state
  const [mediaItems, setMediaItems] = useState([])
  const [mediaForm, setMediaForm] = useState({ title: '', media_type: 'image', file: null })
  const [selectedImage, setSelectedImage] = useState(null)

  const tabs = [
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'stats', label: 'Statistics', icon: Settings },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'portfolio', label: 'Portfolio', icon: FolderOpen },
    { id: 'gallery', label: 'Service Gallery', icon: Image }
  ]

  const iconOptions = [
    'FiCamera', 'FiUsers', 'FiFilm', 'FiBriefcase', 'FiAperture', 'FiSun'
  ]

  useEffect(() => {
    loadData()
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'gallery' && selectedService) {
      loadData()
    }
  }, [selectedService])

  useEffect(() => {
    if (activeTab === 'portfolio' && selectedCategory) {
      const loadPortfolioImages = async () => {
        try {
          const imagesData = await getPortfolioImages(selectedCategory)
          setPortfolioImages(Array.isArray(imagesData) ? imagesData : [])
        } catch (error) {
          setPortfolioImages([])
        }
      }
      loadPortfolioImages()
    }
  }, [selectedCategory])

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'content':
          const contentData = await getStudioContent()
          setContent(contentData || {})
          const mediaItemsData = await getMediaItems()
          setMediaItems(Array.isArray(mediaItemsData) ? mediaItemsData : [])
          break
        case 'stats':
          const statsData = await getStudioStats()
          setStats(Array.isArray(statsData) ? statsData : [])
          break
        case 'services':
          const servicesData = await getServices()
          setServices(Array.isArray(servicesData) ? servicesData : [])
          break
        case 'testimonials':
          const testimonialsData = await getTestimonials()
          setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : [])
          break
        case 'portfolio':
          const categoriesData = await getPortfolioCategories()
          console.log('Loaded categories:', categoriesData)
          setCategories(Array.isArray(categoriesData) ? categoriesData : [])
          if (selectedCategory) {
            const imagesData = await getPortfolioImages(selectedCategory)
            setPortfolioImages(Array.isArray(imagesData) ? imagesData : [])
          }
          break
        case 'gallery':
          const servicesData2 = await getServices()
          setServices(Array.isArray(servicesData2) ? servicesData2 : [])
          if (selectedService) {
            const galleryData = await getServiceGalleryImages(selectedService)
            setServiceGalleryImages(Array.isArray(galleryData) ? galleryData : [])
          }
          break
      }
    } catch (error) {
      toast.error(error.message)
      // Set empty arrays on error to prevent map errors
      if (activeTab === 'services') setServices([])
      if (activeTab === 'testimonials') setTestimonials([])
      if (activeTab === 'portfolio') setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleContentSave = async () => {
    try {
      await updateStudioContent(content)
      toast.success('Content updated successfully')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleServiceSave = async () => {
    try {
      if (editingService) {
        await updateService(editingService.id, serviceForm)
        toast.success('Service updated successfully')
      } else {
        await createService(serviceForm)
        toast.success('Service created successfully')
      }
      setEditingService(null)
      setServiceForm({ title: '', description: '', icon: 'FiCamera', is_active: true })
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleServiceDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      await deleteService(id)
      toast.success('Service deleted successfully')
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleTestimonialSave = async () => {
    try {
      const formData = new FormData()
      formData.append('name', testimonialForm.name)
      formData.append('role', testimonialForm.role)
      formData.append('quote', testimonialForm.quote)
      if (testimonialForm.avatar) {
        formData.append('avatar', testimonialForm.avatar)
      }

      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, formData)
        toast.success('Testimonial updated successfully')
      } else {
        await createTestimonial(formData)
        toast.success('Testimonial created successfully')
      }
      setEditingTestimonial(null)
      setTestimonialForm({ name: '', role: '', quote: '', avatar: null, is_active: true })
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleTestimonialDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    try {
      await deleteTestimonial(id)
      toast.success('Testimonial deleted successfully')
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleCategorySave = async () => {
    try {
      if (editingCategory) {
        await updatePortfolioCategory(editingCategory.id, categoryForm)
        toast.success('Category updated successfully')
      } else {
        await createPortfolioCategory(categoryForm)
        toast.success('Category created successfully')
      }
      setEditingCategory(null)
      setCategoryForm({ name: '', is_active: true })
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleStatSave = async () => {
    try {
      if (editingStat) {
        await updateStudioStat(editingStat.id, statForm)
        toast.success('Statistic updated successfully')
      } else {
        await createStudioStat(statForm)
        toast.success('Statistic created successfully')
      }
      setEditingStat(null)
      setStatForm({ label: '', value: '', icon: 'FiUsers', order: 0, is_active: true })
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleStatDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this statistic?')) return
    try {
      await deleteStudioStat(id)
      toast.success('Statistic deleted successfully')
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleCategoryDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await deletePortfolioCategory(id)
      toast.success('Category deleted successfully')
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handlePortfolioUpload = async (result) => {
    try {
      toast.success(`Uploaded ${result.images?.length || 0} images successfully`)
      if (selectedCategory) {
        const imagesData = await getPortfolioImages(selectedCategory)
        setPortfolioImages(Array.isArray(imagesData) ? imagesData : [])
      }
    } catch (error) {
      toast.error('Failed to refresh portfolio images')
    }
  }

  const handleServiceGalleryUpload = async (result) => {
    try {
      toast.success(`Uploaded ${result.images?.length || 0} images successfully`)
      if (selectedService) {
        const galleryData = await getServiceGalleryImages(selectedService)
        setServiceGalleryImages(Array.isArray(galleryData) ? galleryData : [])
      }
    } catch (error) {
      toast.error('Failed to refresh gallery images')
    }
  }

  const handleMediaItemSave = async () => {
    try {
      const formData = new FormData()
      formData.append('title', mediaForm.title)
      formData.append('media_type', mediaForm.media_type)
      if (mediaForm.file) {
        formData.append('file', mediaForm.file)
      }

      await createMediaItem(formData)
      toast.success('Media item added successfully')
      setMediaForm({ title: '', media_type: 'image', file: null })
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleMediaItemDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this media item?')) return
    try {
      await deleteMediaItem(id)
      toast.success('Media item deleted successfully')
      loadData()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (dragIndex === dropIndex) return
    
    const newItems = [...mediaItems]
    const draggedItem = newItems[dragIndex]
    newItems.splice(dragIndex, 1)
    newItems.splice(dropIndex, 0, draggedItem)
    
    // Update order values
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))
    
    setMediaItems(updatedItems)
    
    // Update database
    try {
      await Promise.all(
        updatedItems.map(item => 
          updateMediaItem(item.id, { order: item.order })
        )
      )
      toast.success('Order updated successfully')
    } catch (error) {
      toast.error('Failed to update order')
      loadData() // Reload on error
    }
  }

  return (
    <motion.div
      className="py-8 gradient-bg min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container-app">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Studio <span style={{ color: 'var(--accent)' }}>Management</span>
          </h1>
          <p className="font-sans text-lg md:text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-soft)' }}>
            Manage your studio content, services, and portfolio with ease
          </p>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 backdrop-filter backdrop-blur-sm ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg transform -translate-y-1'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md hover:-translate-y-0.5'
                } border border-white/20 dark:border-gray-700/50`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Content Tab */}
        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: 'var(--text)' }}>
                    Studio Content
                  </h2>
                  <p className="font-sans text-sm" style={{ color: 'var(--text-soft)' }}>
                    Manage your studio's main content and messaging
                  </p>
                </div>
                <motion.button
                  onClick={handleContentSave}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </motion.button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Hero Title
                  </label>
                  <input
                    type="text"
                    value={content.hero_title}
                    onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                    className="input-enhanced w-full px-4 py-3 font-serif text-lg"
                    placeholder="Your Studio Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    About Title
                  </label>
                  <input
                    type="text"
                    value={content.about_title}
                    onChange={(e) => setContent({ ...content, about_title: e.target.value })}
                    className="input-enhanced w-full px-4 py-3 font-serif text-lg"
                    placeholder="About Our Studio"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Hero Subtitle
                  </label>
                  <textarea
                    rows="3"
                    value={content.hero_subtitle}
                    onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                    className="input-enhanced w-full px-4 py-3 font-sans resize-none"
                    placeholder="Capturing life's most precious moments..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    About Text
                  </label>
                  <textarea
                    rows="5"
                    value={content.about_text}
                    onChange={(e) => setContent({ ...content, about_text: e.target.value })}
                    className="input-enhanced w-full px-4 py-3 font-sans resize-none"
                    placeholder="Tell your story and what makes your studio special..."
                  />
                </div>
              </div>
            </div>

            {/* Media Items Section */}
            <div className="card-enhanced">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-serif font-semibold mb-1" style={{ color: 'var(--text)' }}>
                    Hero Media Items
                  </h2>
                  <p className="font-sans text-sm" style={{ color: 'var(--text-soft)' }}>
                    Add images and videos for your homepage hero section
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={mediaForm.title}
                    onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Optional title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Media Type
                  </label>
                  <select
                    value={mediaForm.media_type}
                    onChange={(e) => setMediaForm({ ...mediaForm, media_type: e.target.value })}
                    className="input-enhanced w-full px-4 py-3"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    File
                  </label>
                  <div 
                    className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-pink-400 dark:hover:border-pink-500 transition-all duration-300 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-pink-500', 'bg-pink-50/50') }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('border-pink-500', 'bg-pink-50/50') }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.currentTarget.classList.remove('border-pink-500', 'bg-pink-50/50')
                      const files = e.dataTransfer.files
                      if (files.length > 0) {
                        setMediaForm({ ...mediaForm, file: files[0] })
                      }
                    }}
                  >
                    <input
                      type="file"
                      accept={mediaForm.media_type === 'image' ? 'image/*' : 'video/*'}
                      onChange={(e) => setMediaForm({ ...mediaForm, file: e.target.files[0] })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <Upload className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                          {mediaForm.file ? mediaForm.file.name : 'Drop your file here'}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-soft)' }}>
                          or click to browse • {mediaForm.media_type === 'image' ? 'Images' : 'Videos'} only
                        </p>
                      </div>
                      {mediaForm.file && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          File selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={handleMediaItemSave}
                disabled={!mediaForm.file}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                whileHover={{ scale: !mediaForm.file ? 1 : 1.02 }}
                whileTap={{ scale: !mediaForm.file ? 1 : 0.98 }}
              >
                <Plus className="w-4 h-4" />
                Add Media Item
              </motion.button>

              {mediaItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mt-8"
                >
                  <h3 className="text-lg font-serif font-semibold mb-6" style={{ color: 'var(--text)' }}>
                    Current Media Items ({mediaItems.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mediaItems.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className="group cursor-move relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 bg-white dark:bg-gray-800 shadow-md"
                      >
                        <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded flex items-center justify-center">
                            <GripVertical size={12} className="text-white" />
                          </div>
                        </div>
                        <div onClick={() => setSelectedImage(item.url)} className="cursor-pointer">
                          {item.media_type === 'image' ? (
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <video
                              src={item.url}
                              className="w-full h-auto object-cover transition-all duration-700 group-hover:scale-105"
                              controls
                              muted
                              preload="metadata"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="flex items-center justify-between">
                                <span className="text-white text-sm font-medium bg-slate-900/70 backdrop-blur-sm px-3 py-1 rounded-full">
                                  {item.media_type}
                                </span>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMediaItemDelete(item.id)
                                  }}
                                  className="w-8 h-8 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  <Trash2 size={14} className="text-white" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: 'var(--text)' }}>
                    {editingStat ? 'Edit Statistic' : 'Add New Statistic'}
                  </h2>
                  <p className="font-sans text-sm" style={{ color: 'var(--text-soft)' }}>
                    Showcase your studio's achievements and milestones
                  </p>
                </div>
                {editingStat && (
                  <motion.button
                    onClick={() => {
                      setEditingStat(null)
                      setStatForm({ label: '', value: '', icon: 'FiUsers', order: 0, is_active: true })
                    }}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Label
                  </label>
                  <input
                    type="text"
                    value={statForm.label}
                    onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Happy Clients"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Value
                  </label>
                  <input
                    type="text"
                    value={statForm.value}
                    onChange={(e) => setStatForm({ ...statForm, value: e.target.value })}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="500+"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Icon
                  </label>
                  <select
                    value={statForm.icon}
                    onChange={(e) => setStatForm({ ...statForm, icon: e.target.value })}
                    className="input-enhanced w-full px-4 py-3"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={statForm.order}
                    onChange={(e) => setStatForm({ ...statForm, order: parseInt(e.target.value) || 0 })}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={statForm.is_active}
                      onChange={(e) => setStatForm({ ...statForm, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span className="font-sans text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <motion.button
                onClick={handleStatSave}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                {editingStat ? 'Update Statistic' : 'Add Statistic'}
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const getIconComponent = (iconName) => {
                  const iconMap = {
                    'FiUsers': '👥',
                    'FiCamera': '📷', 
                    'FiAward': '🏆',
                    'FiHeart': '❤️',
                    'FiFilm': '🎬',
                    'FiBriefcase': '💼',
                    'FiAperture': '📸',
                    'FiSun': '☀️'
                  }
                  return iconMap[iconName] || '📊'
                }
                
                return (
                  <motion.div
                    key={stat.id}
                    className="card-enhanced group relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white shadow-lg text-2xl">
                          {getIconComponent(stat.icon)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            stat.is_active 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {stat.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() => {
                                setEditingStat(stat)
                                setStatForm({
                                  label: stat.label,
                                  value: stat.value,
                                  icon: stat.icon,
                                  order: stat.order,
                                  is_active: stat.is_active
                                })
                              }}
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200"
                              title="Edit"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleStatDelete(stat.id)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all duration-200"
                              title="Delete"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h3 className="text-lg font-serif font-semibold mb-1" style={{ color: 'var(--text)' }}>
                          {stat.label}
                        </h3>
                        <p className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                          {formatNumber(stat.value)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-soft)' }}>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                          Order: {stat.order}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                          {stat.icon}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: 'var(--text)' }}>
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <p className="font-sans text-sm" style={{ color: 'var(--text-soft)' }}>
                    Manage the services you offer to your clients
                  </p>
                </div>
                {editingService && (
                  <motion.button
                    onClick={() => {
                      setEditingService(null)
                      setServiceForm({ title: '', description: '', icon: 'FiCamera', is_active: true })
                    }}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Service Title
                  </label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Wedding Photography"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Icon
                  </label>
                  <select
                    value={serviceForm.icon}
                    onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                    className="input-enhanced w-full px-4 py-3"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Description
                  </label>
                  <textarea
                    rows="4"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    className="input-enhanced w-full px-4 py-3 resize-none"
                    placeholder="Describe your service and what makes it special..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={serviceForm.is_active}
                      onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span className="font-sans text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <motion.button
                onClick={handleServiceSave}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                {editingService ? 'Update Service' : 'Add Service'}
              </motion.button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {services.map((service, index) => {
                const getServiceIcon = (iconName) => {
                  const iconMap = {
                    'FiCamera': '📷',
                    'FiUsers': '👥', 
                    'FiFilm': '🎬',
                    'FiBriefcase': '💼',
                    'FiAperture': '📸',
                    'FiSun': '☀️'
                  }
                  return iconMap[iconName] || '📷'
                }
                
                return (
                  <motion.div
                    key={service.id}
                    className="card-enhanced group relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg text-2xl">
                          {getServiceIcon(service.icon)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            service.is_active 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() => {
                                setEditingService(service)
                                setServiceForm({
                                  title: service.title,
                                  description: service.description,
                                  icon: service.icon,
                                  is_active: service.is_active
                                })
                              }}
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200"
                              title="Edit Service"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleServiceDelete(service.id)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all duration-200"
                              title="Delete Service"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      <div className="mb-3">
                        <h3 className="text-lg font-serif font-semibold mb-2" style={{ color: 'var(--text)' }}>
                          {service.title}
                        </h3>
                        <p className="text-sm font-sans leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'var(--blush)', color: 'var(--accent)' }}>
                          {service.gallery_count || 0} images
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
                          {service.icon}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Testimonials Tab */}
        {activeTab === 'testimonials' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: 'var(--text)' }}>
                    {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                  </h2>
                  <p className="font-sans text-sm" style={{ color: 'var(--text-soft)' }}>
                    Share what your clients say about your work
                  </p>
                </div>
                {editingTestimonial && (
                  <motion.button
                    onClick={() => {
                      setEditingTestimonial(null)
                      setTestimonialForm({ name: '', role: '', quote: '', avatar: null, is_active: true })
                    }}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Sarah Johnson"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Role/Title
                  </label>
                  <input
                    type="text"
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    className="input-enhanced w-full px-4 py-3"
                    placeholder="Bride, Wedding Client"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Testimonial Quote
                  </label>
                  <textarea
                    rows="4"
                    value={testimonialForm.quote}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                    className="input-enhanced w-full px-4 py-3 resize-none"
                    placeholder="Share what the client said about your work..."
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium font-sans" style={{ color: 'var(--text)' }}>
                    Avatar Image
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, avatar: e.target.files[0] })}
                      className="input-enhanced w-full px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-pink-50 file:to-pink-100 file:text-pink-700 hover:file:from-pink-100 hover:file:to-pink-200 file:transition-all file:duration-200 file:shadow-sm hover:file:shadow-md"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Upload className="w-5 h-5" style={{ color: 'var(--text-soft)' }} />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={testimonialForm.is_active}
                      onChange={(e) => setTestimonialForm({ ...testimonialForm, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span className="font-sans text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <motion.button
                onClick={handleTestimonialSave}
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-4 h-4" />
                {editingTestimonial ? 'Update Testimonial' : 'Add Testimonial'}
              </motion.button>
            </div>

            <div className="grid gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  className="card group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {testimonial.avatar ? (
                          <div className="relative">
                            <img
                              src={testimonial.avatar}
                              alt={testimonial.name}
                              className="w-16 h-16 rounded-full object-cover border-3 border-pink-200 dark:border-pink-800 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105"
                            />
                            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-xl font-serif shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105 border-2 border-pink-300 dark:border-pink-700">
                            {testimonial.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-serif font-semibold" style={{ color: 'var(--text)' }}>
                              {testimonial.name}
                            </h3>
                            <p className="text-sm font-sans" style={{ color: 'var(--text-soft)' }}>
                              {testimonial.role}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            testimonial.is_active 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {testimonial.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <blockquote className="text-sm font-sans italic leading-relaxed p-4 rounded-lg" style={{ 
                          color: 'var(--text-soft)', 
                          background: 'var(--blush)',
                          borderLeft: '4px solid var(--accent)'
                        }}>
                          "{testimonial.quote}"
                        </blockquote>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
                      <motion.button
                        onClick={() => {
                          setEditingTestimonial(testimonial)
                          setTestimonialForm({
                            name: testimonial.name,
                            role: testimonial.role,
                            quote: testimonial.quote,
                            avatar: null,
                            is_active: testimonial.is_active
                          })
                        }}
                        className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200"
                        title="Edit Testimonial"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleTestimonialDelete(testimonial.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all duration-200"
                        title="Delete Testimonial"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced">
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  Portfolio Categories
                </h2>
                <p className="font-sans text-sm" style={{ color: 'var(--text-soft)' }}>
                  Organize your portfolio into different categories
                </p>
              </div>
              
              <div className="space-y-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Category name (e.g., Weddings, Portraits)"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="input-enhanced flex-1 px-4 py-3"
                  />
                  <motion.button
                    onClick={handleCategorySave}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-pink-600/25 transition-all duration-300 whitespace-nowrap"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4" />
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </motion.button>
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-2 cursor-pointer"
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <span className="font-sans text-sm font-medium" style={{ color: 'var(--text)' }}>
                      Active (visible on website)
                    </span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    className="card-enhanced group relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full -translate-y-6 translate-x-6"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-lg text-2xl">
                          🖼️
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            category.is_active 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button
                              onClick={() => {
                                setEditingCategory(category)
                                setCategoryForm({ name: category.name, is_active: category.is_active })
                              }}
                              className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 transition-all duration-200"
                              title="Edit Category"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleCategoryDelete(category.id)}
                              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-all duration-200"
                              title="Delete Category"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-lg font-serif font-semibold mb-1" style={{ color: 'var(--text)' }}>
                          {category.name}
                        </h3>
                        <p className="text-sm font-sans" style={{ color: 'var(--text-soft)' }}>
                          Portfolio category
                        </p>
                      </div>
                      <motion.button
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                          selectedCategory === category.id 
                            ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Eye className="w-4 h-4" />
                        {selectedCategory === category.id ? 'Selected' : 'View Images'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedCategory && (
              <div className="card-enhanced">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-xl font-serif font-semibold mb-1" style={{ color: 'var(--text)' }}>
                      Portfolio Images
                    </h3>
                    <p className="font-sans text-sm" style={{ color: 'var(--text-soft)' }}>
                      Upload and manage images for this category
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setSelectedCategory(null)}
                    className="btn-ghost flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-4 h-4" />
                    Close
                  </motion.button>
                </div>

                <div className="mb-8">
                  <MultipleImageUpload
                    onUploadComplete={handlePortfolioUpload}
                    uploadFunction={bulkUploadPortfolioImages}
                    categoryId={selectedCategory}
                    acceptedTypes="image/*"
                    maxFiles={50}
                  />
                </div>

                {portfolioImages.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-serif font-semibold" style={{ color: 'var(--text)' }}>
                        Current Images
                      </h4>
                      <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'var(--blush)', color: 'var(--accent)' }}>
                        {portfolioImages.length} images
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {portfolioImages.map((image, index) => (
                        <motion.div
                          key={image.id}
                          className="relative group cursor-move"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.05 * index }}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault()
                            const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
                            if (dragIndex === index) return
                            
                            const newImages = [...portfolioImages]
                            const draggedImage = newImages[dragIndex]
                            newImages.splice(dragIndex, 1)
                            newImages.splice(index, 0, draggedImage)
                            setPortfolioImages(newImages)
                            toast.success('Order updated successfully')
                          }}
                        >
                          <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded flex items-center justify-center">
                              <GripVertical size={12} className="text-white" />
                            </div>
                          </div>
                          <div 
                            className="aspect-square overflow-hidden rounded-xl shadow-lg border-2 border-purple-100 dark:border-purple-900/30 cursor-pointer"
                            onClick={() => setSelectedImage(image.url)}
                          >
                            <img
                              src={image.thumbnail_url || image.url}
                              alt="Portfolio"
                              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (confirm('Delete this image?')) {
                                deletePortfolioImage(image.id).then(() => {
                                  const imagesData = getPortfolioImages(selectedCategory)
                                  setPortfolioImages(Array.isArray(imagesData) ? imagesData : [])
                                })
                              }
                            }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-sm font-bold shadow-lg"
                            title="Delete Image"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Service Gallery Tab */}
        {activeTab === 'gallery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="card-enhanced">
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-semibold mb-2" style={{ color: 'var(--text)' }}>
                  Service Gallery Management
                </h2>
                <p className="font-sans text-sm" style={{ color: 'var(--text-soft)' }}>
                  Upload and manage images for your services
                </p>
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-medium font-sans mb-3" style={{ color: 'var(--text)' }}>
                  Select Service
                </label>
                <select
                  value={selectedService || ''}
                  onChange={(e) => setSelectedService(e.target.value || null)}
                  className="input-enhanced w-full px-4 py-3"
                >
                  <option value="">Choose a service...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedService && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--blush)' }}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                      <span className="text-lg">📷</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-serif font-semibold" style={{ color: 'var(--text)' }}>
                        {services.find(s => s.id == selectedService)?.title}
                      </h3>
                      <p className="text-sm font-sans" style={{ color: 'var(--text-soft)' }}>
                        Upload images to showcase this service
                      </p>
                    </div>
                  </div>
                  
                  <MultipleImageUpload
                    onUploadComplete={handleServiceGalleryUpload}
                    uploadFunction={bulkUploadServiceImages}
                    serviceId={selectedService}
                    acceptedTypes="image/*"
                    maxFiles={50}
                  />
                  
                  {serviceGalleryImages.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-lg font-serif font-semibold" style={{ color: 'var(--text)' }}>
                          Current Images
                        </h4>
                        <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ background: 'var(--blush)', color: 'var(--accent)' }}>
                          {serviceGalleryImages.length} images
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {serviceGalleryImages.map((image, index) => (
                          <motion.div
                            key={image.id}
                            className="relative group cursor-move"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.05 * index }}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={async (e) => {
                              e.preventDefault()
                              const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
                              if (dragIndex === index) return
                              
                              const newImages = [...serviceGalleryImages]
                              const draggedImage = newImages[dragIndex]
                              newImages.splice(dragIndex, 1)
                              newImages.splice(index, 0, draggedImage)
                              setServiceGalleryImages(newImages)
                              toast.success('Order updated successfully')
                            }}
                          >
                            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded flex items-center justify-center">
                                <GripVertical size={12} className="text-white" />
                              </div>
                            </div>
                            <div 
                              className="aspect-square overflow-hidden rounded-xl shadow-lg border-2 border-blue-100 dark:border-blue-900/30 cursor-pointer"
                              onClick={() => setSelectedImage(image.image)}
                            >
                              <img
                                src={image.image}
                                alt="Service gallery"
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <motion.button
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (confirm('Delete this image?')) {
                                  try {
                                    await deleteServiceGalleryImage(image.id)
                                    toast.success('Image deleted')
                                    loadData()
                                  } catch (error) {
                                    toast.error('Failed to delete image')
                                  }
                                }
                              }}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-sm font-bold shadow-lg"
                              title="Delete Image"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Media Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-700 transition-all duration-300 hover:scale-110 z-10"
          >
            <X size={20} />
          </button>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full h-full max-w-6xl max-h-[85vh] mx-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedImage.includes('.mp4') || selectedImage.includes('.webm') || selectedImage.includes('.mov') ? (
              <video
                src={selectedImage}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            ) : (
              <img
                src={selectedImage}
                alt="Media fullscreen"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
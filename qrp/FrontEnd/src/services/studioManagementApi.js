const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function getAuthHeaders() {
  const token = localStorage.getItem('access_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function parseResponseBody(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch (error) {
    return text
  }
}

async function handleResponse(res, defaultMessage) {
  const data = await parseResponseBody(res)
  if (res.ok) {
    return data
  }
  const errorMessage = defaultMessage || `Request failed with status ${res.status}`
  const error = new Error(errorMessage)
  error.response = {
    status: res.status,
    data,
  }
  throw error
}

function uploadWithProgress({ url, method = 'POST', formData, defaultMessage, onProgress }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)

    const token = localStorage.getItem('access_token')
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          onProgress(1)
          return
        }
        const percent = Math.min(100, Math.max(1, Math.round((event.loaded / event.total) * 100)))
        onProgress(percent)
      }
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== XMLHttpRequest.DONE) return
      const responseText = xhr.responseText
      let data = null
      if (responseText) {
        try {
          data = JSON.parse(responseText)
        } catch (error) {
          data = responseText
        }
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data)
        return
      }

      const errorMessage = defaultMessage || `Request failed with status ${xhr.status}`
      const error = new Error(errorMessage)
      error.response = {
        status: xhr.status,
        data,
      }
      reject(error)
    }

    xhr.onerror = () => {
      const error = new Error(defaultMessage || 'Network error during upload')
      reject(error)
    }

    if (typeof onProgress === 'function') {
      onProgress(1)
    }

    xhr.send(formData)
  })
}

// Studio Content Management
export async function getStudioContent() {
  const res = await fetch(`${API_BASE}/api/manage/content/`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Failed to fetch studio content')
}

export async function updateStudioContent(data) {
  const res = await fetch(`${API_BASE}/api/manage/content/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update studio content')
}

// Studio Contact + Social Links Management
export async function getStudioContactInfo() {
  const res = await fetch(`${API_BASE}/api/manage/contact/`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Failed to fetch studio contact info')
}

export async function updateStudioContactInfo(data) {
  const res = await fetch(`${API_BASE}/api/manage/contact/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update studio contact info')
}

// Studio Stats Management
export async function getStudioStats() {
  const res = await fetch(`${API_BASE}/api/manage/stats/`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch studio stats')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createStudioStat(data) {
  const res = await fetch(`${API_BASE}/api/manage/stats/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to create studio stat')
}

export async function updateStudioStat(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/stats/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update studio stat')
}

export async function deleteStudioStat(id) {
  const res = await fetch(`${API_BASE}/api/manage/stats/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete studio stat')
}

export async function getSocialLinks() {
  const res = await fetch(`${API_BASE}/api/manage/social-links/`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch social links')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createSocialLink(data) {
  const res = await fetch(`${API_BASE}/api/manage/social-links/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to create social link')
}

export async function updateSocialLink(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/social-links/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update social link')
}

export async function deleteSocialLink(id) {
  const res = await fetch(`${API_BASE}/api/manage/social-links/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete social link')
}

// Services Management
export async function getServices() {
  const res = await fetch(`${API_BASE}/api/manage/services/`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch services')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createService(data) {
  const res = await fetch(`${API_BASE}/api/manage/services/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to create service')
}

export async function updateService(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/services/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update service')
}

export async function deleteService(id) {
  const res = await fetch(`${API_BASE}/api/manage/services/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete service')
}

// Testimonials Management
export async function getTestimonials() {
  const res = await fetch(`${API_BASE}/api/manage/testimonials/`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch testimonials')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createTestimonial(formData) {
  const token = localStorage.getItem('access_token')
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const res = await fetch(`${API_BASE}/api/manage/testimonials/`, {
    method: 'POST',
    headers,
    body: formData,
  })
  return handleResponse(res, 'Failed to create testimonial')
}

export async function updateTestimonial(id, formData) {
  const token = localStorage.getItem('access_token')
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const res = await fetch(`${API_BASE}/api/manage/testimonials/${id}/`, {
    method: 'PATCH',
    headers,
    body: formData,
  })
  return handleResponse(res, 'Failed to update testimonial')
}

export async function deleteTestimonial(id) {
  const res = await fetch(`${API_BASE}/api/manage/testimonials/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete testimonial')
}

// Portfolio Categories Management
export async function getPortfolioCategories() {
  const res = await fetch(`${API_BASE}/api/manage/categories/`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch categories')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createPortfolioCategory(data) {
  const res = await fetch(`${API_BASE}/api/manage/categories/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to create category')
}

export async function updatePortfolioCategory(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/categories/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update category')
}

export async function deletePortfolioCategory(id) {
  const res = await fetch(`${API_BASE}/api/manage/categories/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete category')
}

// Portfolio Images Management
export async function getPortfolioImages(categoryId = null) {
  const params = categoryId ? `?category_id=${categoryId}` : ''
  const res = await fetch(`${API_BASE}/api/manage/portfolio/${params}`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch portfolio images')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function deletePortfolioImage(id) {
  const res = await fetch(`${API_BASE}/api/manage/portfolio/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete portfolio image')
}

export async function updatePortfolioImage(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/portfolio/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update portfolio image')
}

// Service Gallery Management
export async function getServiceGalleryImages(serviceId = null) {
  const params = serviceId ? `?service_id=${serviceId}` : ''
  const res = await fetch(`${API_BASE}/api/manage/service-gallery/${params}`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch service gallery images')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function deleteServiceGalleryImage(id) {
  const res = await fetch(`${API_BASE}/api/manage/service-gallery/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete service gallery image')
}

export async function updateServiceGalleryImage(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/service-gallery/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update service gallery image')
}

// Bulk Upload Functions (reuse existing)
export async function bulkUploadPortfolioImages(categoryId, files, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('category_id', categoryId)
    files.forEach(file => formData.append('images', file))
    
    const xhr = new XMLHttpRequest()
    
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          onProgress(percentComplete)
        }
      })
    }
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve(data)
        } catch (err) {
          reject(new Error('Failed to parse response'))
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status})`))
      }
    })
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })
    
    const token = localStorage.getItem('access_token')
    xhr.open('POST', `${API_BASE}/api/uploads/portfolio/`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}

export async function bulkUploadServiceImages(serviceId, files, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('service_id', serviceId)
    files.forEach(file => formData.append('images', file))
    
    const xhr = new XMLHttpRequest()
    
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          onProgress(percentComplete)
        }
      })
    }
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve(data)
        } catch (err) {
          reject(new Error('Failed to parse response'))
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status})`))
      }
    })
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })
    
    const token = localStorage.getItem('access_token')
    xhr.open('POST', `${API_BASE}/api/uploads/service/`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}

// Media Items Management
export async function getMediaItems() {
  const res = await fetch(`${API_BASE}/api/manage/media-items/`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch media items')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createMediaItem(formData) {
  const token = localStorage.getItem('access_token')
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const res = await fetch(`${API_BASE}/api/manage/media-items/`, {
    method: 'POST',
    headers,
    body: formData,
  })
  return handleResponse(res, 'Failed to create media item')
}

export async function deleteMediaItem(id) {
  const res = await fetch(`${API_BASE}/api/manage/media-items/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete media item')
}

export async function updateMediaItem(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/media-items/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update media item')
}

// Video Categories Management
export async function getVideoCategories() {
  const res = await fetch(`${API_BASE}/api/manage/video-categories/`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch video categories')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createVideoCategory(data) {
  const res = await fetch(`${API_BASE}/api/manage/video-categories/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to create video category')
}

export async function updateVideoCategory(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/video-categories/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  return handleResponse(res, 'Failed to update video category')
}

export async function deleteVideoCategory(id) {
  const res = await fetch(`${API_BASE}/api/manage/video-categories/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete video category')
}

// Videos Management
export async function getVideos(categoryId = null) {
  const params = categoryId ? `?category_id=${categoryId}` : ''
  const res = await fetch(`${API_BASE}/api/manage/videos/${params}`, {
    headers: getAuthHeaders(),
  })
  const data = await handleResponse(res, 'Failed to fetch videos')
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createVideo(formData, onProgress) {
  return uploadWithProgress({
    url: `${API_BASE}/api/manage/videos/`,
    method: 'POST',
    formData,
    defaultMessage: 'Failed to create video',
    onProgress,
  })
}

export async function updateVideo(id, formData, onProgress) {
  return uploadWithProgress({
    url: `${API_BASE}/api/manage/videos/${id}/`,
    method: 'PATCH',
    formData,
    defaultMessage: 'Failed to update video',
    onProgress,
  })
}

export async function deleteVideo(id) {
  const res = await fetch(`${API_BASE}/api/manage/videos/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete video')
}

// Bulk Upload Videos
export async function bulkUploadVideos(categoryId, videoFiles, thumbnailFilesOrProgress, maybeOnProgress) {
  let thumbnailFiles = thumbnailFilesOrProgress
  let onProgress = maybeOnProgress

  // Allow callers that only pass (categoryId, files, onProgress)
  if (typeof thumbnailFilesOrProgress === 'function') {
    onProgress = thumbnailFilesOrProgress
    thumbnailFiles = []
  }

  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('category_id', categoryId)
    videoFiles.forEach(file => formData.append('videos', file))
    if (Array.isArray(thumbnailFiles) && thumbnailFiles.length > 0) {
      thumbnailFiles.forEach(file => formData.append('thumbnails', file))
    }

    const xhr = new XMLHttpRequest()

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          onProgress(percentComplete)
        }
      })
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve(data)
        } catch (err) {
          reject(new Error('Failed to parse response'))
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status})`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    const token = localStorage.getItem('access_token')
    xhr.open('POST', `${API_BASE}/api/uploads/videos/`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(formData)
  })
}

// Contact Messages Management
export async function getContactMessages(params = {}) {
  const query = new URLSearchParams()
  if (params.page) {
    query.set('page', params.page)
  }
  if (params.page_size) {
    query.set('page_size', params.page_size)
  }
  if (params.status) {
    query.set('status', params.status)
  }
  const queryString = query.toString() ? `?${query.toString()}` : ''
  const res = await fetch(`${API_BASE}/api/manage/messages/${queryString}`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Failed to fetch contact messages')
}

export async function getContactMessage(id) {
  const res = await fetch(`${API_BASE}/api/manage/messages/${id}/`, {
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Failed to fetch contact message')
}

export async function updateContactMessageStatus(id, status) {
  const res = await fetch(`${API_BASE}/api/manage/messages/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  })
  return handleResponse(res, 'Failed to update contact message status')
}

export async function deleteContactMessage(id) {
  const res = await fetch(`${API_BASE}/api/manage/messages/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  await handleResponse(res, 'Failed to delete contact message')
}

export async function deleteContactMessages(filter = {}) {
  const query = new URLSearchParams()
  if (filter.status && filter.status !== 'all') {
    query.set('status', filter.status)
  }
  const queryString = query.toString() ? `?${query.toString()}` : ''
  const res = await fetch(`${API_BASE}/api/manage/messages/${queryString}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  return handleResponse(res, 'Failed to delete contact messages')
}
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function getAuthHeaders() {
  const token = localStorage.getItem('access_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// Studio Content Management
export async function getStudioContent() {
  const res = await fetch(`${API_BASE}/api/manage/content/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch studio content')
  return res.json()
}

export async function updateStudioContent(data) {
  const res = await fetch(`${API_BASE}/api/manage/content/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update studio content')
  return res.json()
}

// Studio Stats Management
export async function getStudioStats() {
  const res = await fetch(`${API_BASE}/api/manage/stats/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch studio stats')
  const data = await res.json()
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createStudioStat(data) {
  const res = await fetch(`${API_BASE}/api/manage/stats/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create studio stat')
  return res.json()
}

export async function updateStudioStat(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/stats/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update studio stat')
  return res.json()
}

export async function deleteStudioStat(id) {
  const res = await fetch(`${API_BASE}/api/manage/stats/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete studio stat')
}

// Services Management
export async function getServices() {
  const res = await fetch(`${API_BASE}/api/manage/services/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch services')
  const data = await res.json()
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createService(data) {
  const res = await fetch(`${API_BASE}/api/manage/services/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create service')
  return res.json()
}

export async function updateService(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/services/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update service')
  return res.json()
}

export async function deleteService(id) {
  const res = await fetch(`${API_BASE}/api/manage/services/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete service')
}

// Testimonials Management
export async function getTestimonials() {
  const res = await fetch(`${API_BASE}/api/manage/testimonials/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch testimonials')
  const data = await res.json()
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
  if (!res.ok) throw new Error('Failed to create testimonial')
  return res.json()
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
  if (!res.ok) throw new Error('Failed to update testimonial')
  return res.json()
}

export async function deleteTestimonial(id) {
  const res = await fetch(`${API_BASE}/api/manage/testimonials/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete testimonial')
}

// Portfolio Categories Management
export async function getPortfolioCategories() {
  const res = await fetch(`${API_BASE}/api/manage/categories/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch categories')
  const data = await res.json()
  return Array.isArray(data) ? data : (data.results || [])
}

export async function createPortfolioCategory(data) {
  const res = await fetch(`${API_BASE}/api/manage/categories/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

export async function updatePortfolioCategory(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/categories/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update category')
  return res.json()
}

export async function deletePortfolioCategory(id) {
  const res = await fetch(`${API_BASE}/api/manage/categories/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete category')
}

// Portfolio Images Management
export async function getPortfolioImages(categoryId = null) {
  const params = categoryId ? `?category_id=${categoryId}` : ''
  const res = await fetch(`${API_BASE}/api/manage/portfolio/${params}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch portfolio images')
  const data = await res.json()
  return Array.isArray(data) ? data : (data.results || [])
}

export async function deletePortfolioImage(id) {
  const res = await fetch(`${API_BASE}/api/manage/portfolio/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete portfolio image')
}

// Service Gallery Management
export async function getServiceGalleryImages(serviceId = null) {
  const params = serviceId ? `?service_id=${serviceId}` : ''
  const res = await fetch(`${API_BASE}/api/manage/service-gallery/${params}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to fetch service gallery images')
  const data = await res.json()
  return Array.isArray(data) ? data : (data.results || [])
}

export async function deleteServiceGalleryImage(id) {
  const res = await fetch(`${API_BASE}/api/manage/service-gallery/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete service gallery image')
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
    formData.append('category_id', serviceId)
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
  if (!res.ok) throw new Error('Failed to fetch media items')
  const data = await res.json()
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
  if (!res.ok) throw new Error('Failed to create media item')
  return res.json()
}

export async function deleteMediaItem(id) {
  const res = await fetch(`${API_BASE}/api/manage/media-items/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to delete media item')
}

export async function updateMediaItem(id, data) {
  const res = await fetch(`${API_BASE}/api/manage/media-items/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update media item')
  return res.json()
}
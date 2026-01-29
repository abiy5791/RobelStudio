const API_BASE = import.meta.env.VITE_API_BASE || ''

// Helper to get auth token
function getAuthToken() {
  return localStorage.getItem('access_token')
}

// Helper to get headers with auth
function getAuthHeaders() {
  const token = getAuthToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// Authentication APIs
export async function register(userData) {
  const res = await fetch(`${API_BASE}/api/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(userData),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || error.username?.[0] || error.email?.[0] || 'Registration failed')
  }
  return res.json()
}

export async function login(credentials) {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.detail || 'Login failed')
  }
  return res.json()
}

export async function getUserProfile() {
  const res = await fetch(`${API_BASE}/api/auth/profile/`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error('Failed to get profile')
  return res.json()
}

export async function refreshToken(refreshToken) {
  const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  })
  if (!res.ok) throw new Error('Token refresh failed')
  return res.json()
}

// Album APIs
export async function createAlbum(payload) {
  const res = await fetch(`${API_BASE}/api/albums/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to create album (${res.status})`)
  return res.json()
}

export async function listAlbums(page = 1, pageSize = 20) {
  const res = await fetch(`${API_BASE}/api/albums/?page=${page}&page_size=${pageSize}`)
  if (!res.ok) throw new Error(`Failed to load albums (${res.status})`)
  return res.json()
}

export async function getAlbum(slug) {
  const token = getAuthToken()
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}/api/albums/${encodeURIComponent(slug)}/`, {
    headers
  })
  if (!res.ok) throw new Error(`Album not found (${res.status})`)
  return res.json()
}

export async function createGuestMessage(slug, payload) {
  const res = await fetch(`${API_BASE}/api/albums/${encodeURIComponent(slug)}/messages/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Failed to submit message (${res.status})`)
  return res.json()
}

export async function uploadImagesToBackend(files, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    files.forEach((f) => form.append('files', f))
    const token = getAuthToken()
    
    const xhr = new XMLHttpRequest()
    
    // Track upload progress
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
          resolve(data.images || [])
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
    
    xhr.open('POST', `${API_BASE}/api/uploads/images/`)
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(form)
  })
}

export async function getMyAlbums(page = 1, pageSize = 20) {
  const res = await fetch(`${API_BASE}/api/albums/my/?page=${page}&page_size=${pageSize}`, {
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to load albums (${res.status})`)
  return res.json()
}

export async function updateAlbum(slug, payload, onProgress) {
  // If no progress callback, use regular fetch
  if (!onProgress) {
    const res = await fetch(`${API_BASE}/api/albums/${encodeURIComponent(slug)}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Failed to update album (${res.status})`)
    return res.json()
  }
  
  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const token = getAuthToken()
    
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
        reject(new Error(`Failed to update album (${xhr.status})`))
      }
    })
    
    xhr.addEventListener('error', () => {
      reject(new Error('Update failed'))
    })
    
    xhr.open('PATCH', `${API_BASE}/api/albums/${encodeURIComponent(slug)}/`)
    xhr.setRequestHeader('Content-Type', 'application/json')
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }
    xhr.send(JSON.stringify(payload))
  })
}

export async function deleteAlbum(slug) {
  const res = await fetch(`${API_BASE}/api/albums/${encodeURIComponent(slug)}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) throw new Error(`Failed to delete album (${res.status})`)
  return res.status === 204
}

export function downloadPhoto(slug, photoIndex) {
  const url = `${API_BASE}/api/albums/${encodeURIComponent(slug)}/download/${photoIndex}/`
  window.open(url, '_blank')
}

export function downloadAlbumZip(slug) {
  const url = `${API_BASE}/api/albums/${encodeURIComponent(slug)}/download-zip/`
  window.open(url, '_blank')
}

export async function togglePhotoLike(slug, photoId) {
  const res = await fetch(`${API_BASE}/api/albums/${encodeURIComponent(slug)}/photos/${photoId}/like/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Failed to toggle like (${res.status})`)
  return res.json()
}

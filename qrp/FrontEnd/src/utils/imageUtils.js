const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export function getImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return ''
  
  // If it's already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // If it's a relative URL starting with /media/, construct full URL
  if (imageUrl.startsWith('/media/')) {
    return `${API_BASE}${imageUrl}`
  }
  
  // If it's just a path, add /media/ prefix
  return `${API_BASE}/media/${imageUrl}`
}
/**
 * Album utility functions with security validations
 */

// Validate album ID format (UUID or numeric)
export const validateAlbumId = (id) => {
  if (!id || typeof id !== 'string') return false;
  
  // Remove any potential XSS characters
  const sanitized = id.trim();
  if (sanitized !== id || sanitized.length === 0) return false;
  
  // Check for valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  // Check for valid numeric ID (1-10 digits)
  const numericRegex = /^\d{1,10}$/;
  
  // Check for valid slug format (alphanumeric with hyphens/underscores)
  const slugRegex = /^[a-zA-Z0-9_-]{1,50}$/;
  
  return uuidRegex.test(sanitized) || numericRegex.test(sanitized) || slugRegex.test(sanitized);
};

// Sanitize album ID for URL usage
export const sanitizeAlbumId = (id) => {
  if (!validateAlbumId(id)) return null;
  return encodeURIComponent(id.trim());
};

// Generate QR URL for album
export const generateQRUrl = (albumId) => {
  const sanitizedId = sanitizeAlbumId(albumId);
  if (!sanitizedId) return null;
  
  const baseUrl = window.location.origin;
  return `${baseUrl}/?album=${sanitizedId}`;
};

// Check if current page is accessed via QR code
export const isQRAccess = (searchParams) => {
  const albumParam = searchParams.get('album');
  return validateAlbumId(albumParam);
};
export function formatNumber(value) {
  if (!value) return '0';
  
  // Convert to string and remove any existing formatting
  const cleanValue = value.toString().replace(/[^\d.]/g, '');
  const num = parseFloat(cleanValue);
  
  if (isNaN(num)) return value;
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  return num.toLocaleString();
}
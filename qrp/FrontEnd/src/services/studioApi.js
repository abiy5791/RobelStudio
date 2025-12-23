const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const fetchStudioData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/studio/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch studio data:', error);
    throw error;
  }
};
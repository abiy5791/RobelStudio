import React, { useState } from 'react';
import { Upload, X, Image } from 'lucide-react';

const MultipleImageUpload = ({ onUploadComplete, uploadFunction, categoryId, serviceId, acceptedTypes = "image/*", maxFiles = 50 }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState([]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Create previews
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leaks
    URL.revokeObjectURL(previews[index].url);
    
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Use provided upload function if available, otherwise fallback to direct API call
      let result;
      if (uploadFunction) {
        result = await uploadFunction(categoryId || serviceId, selectedFiles, (progress) => {
          setUploadProgress(Math.min(progress, 90));
        });
      } else {
        // Fallback for backward compatibility
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });

        if (categoryId) {
          formData.append('category_id', categoryId);
        } else if (serviceId) {
          formData.append('service_id', serviceId);
        }

        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
        const endpoint = categoryId ? `${API_BASE}/api/uploads/portfolio/` : `${API_BASE}/api/uploads/service/`;
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }
        result = await response.json();
      }

      setUploadProgress(100);
      onUploadComplete?.(result);

      // Clear selections
      setSelectedFiles([]);
      setPreviews([]);

      // Clear file input
      const fileInput = document.getElementById('multiple-file-input');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          id="multiple-file-input"
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
        <label
          htmlFor="multiple-file-input"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <span className="text-sm text-gray-600">
            Click to select multiple images or drag and drop
          </span>
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview.url}
                alt={preview.name}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                {preview.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: 'var(--text-soft)' }}>
            {selectedFiles.length} file(s) selected
          </span>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 rounded-lg font-medium transition-all duration-300 relative overflow-hidden"
            style={{
              background: 'var(--accent)',
              color: 'white',
            }}
          >
            {uploading && uploadProgress > 0 && (
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
                  : uploadProgress === 100
                  ? "Finalizing..."
                  : "Uploading..."}
              </span>
            ) : (
              <span className="flex items-center gap-2 relative z-10">
                <Upload className="w-4 h-4" />
                Upload Images
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MultipleImageUpload;
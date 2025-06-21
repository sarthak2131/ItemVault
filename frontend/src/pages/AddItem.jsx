import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const ITEM_TYPES = [
  'Shirt', 'Pant', 'Shoes', 'Sports Gear', 'Other'
]

function AddItem() {
  const [itemName, setItemName] = useState('')
  const [itemType, setItemType] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const navigate = useNavigate()

  const onDropCoverImage = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setCoverImage({
          file: file,
          preview: reader.result
        })
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const onDropAdditionalImages = useCallback((acceptedFiles) => {
    const newImages = acceptedFiles.map(file => ({
      file: file,
      preview: URL.createObjectURL(file)
    }))
    
    setAdditionalImages(prevImages => [
      ...prevImages, 
      ...newImages
    ])
  }, [])

  const removeCoverImage = () => {
    setCoverImage(null)
  }

  const removeAdditionalImage = (indexToRemove) => {
    setAdditionalImages(prevImages => 
      prevImages.filter((_, index) => index !== indexToRemove)
    )
  }

  const { 
    getRootProps: getCoverRootProps, 
    getInputProps: getCoverInputProps,
    isDragActive: isCoverDragActive 
  } = useDropzone({
    onDrop: onDropCoverImage,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const { 
    getRootProps: getAdditionalRootProps, 
    getInputProps: getAdditionalInputProps,
    isDragActive: isAdditionalDragActive 
  } = useDropzone({
    onDrop: onDropAdditionalImages,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form fields
    if (!itemName || !itemType || !description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!coverImage) {
      toast.error('Please upload a cover image')
      return
    }

    const formData = new FormData()
    formData.append('itemName', itemName)
    formData.append('itemType', itemType)
    formData.append('description', description)
    
    // Append cover image
    if (coverImage) {
      formData.append('coverImage', coverImage.file)
    }
    
    // Append additional images
    additionalImages.forEach((image) => {
      formData.append('additionalImages', image.file)
    })

    try {
      // Show loading toast
      const loadingToast = toast.loading('Adding item...')
      const response = await axios.post('/api/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success('Item successfully added!')
      // Navigate after a short delay to allow toast to be seen
      setTimeout(() => navigate('/'), 1000)
    } catch (error) {
      // Dismiss loading toast before showing error
      toast.dismiss()
      console.error('Error adding item:', error.response ? error.response.data : error)
      toast.error(error.response?.data?.message || 'Failed to add item')
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-primary">Add New Item</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2">Item Name</label>
          <input 
            type="text" 
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter item name"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Item Type</label>
          <select 
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select Item Type</option>
            {ITEM_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows="4"
            placeholder="Enter item description"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Cover Image</label>
          <div 
            {...getCoverRootProps()} 
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
              ${isCoverDragActive ? 'border-primary bg-blue-50' : 'border-gray-300'}
            `}
          >
            <input {...getCoverInputProps()} />
            <div className="flex flex-col items-center">
              <FaCloudUploadAlt className="text-4xl text-primary mb-2" />
              {isCoverDragActive ? (
                <p className="text-primary">Drop the image here</p>
              ) : (
                <p className="text-gray-600">
                  Drag 'n' drop cover image, or click to select
                </p>
              )}
            </div>
          </div>

          {coverImage && (
            <div className="mt-4 relative w-48 h-48">
              <img 
                src={coverImage.preview} 
                alt="Cover Preview" 
                className="w-full h-full object-cover rounded-lg"
              />
              <button 
                type="button"
                onClick={removeCoverImage}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Additional Images</label>
          <div 
            {...getAdditionalRootProps()} 
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
              ${isAdditionalDragActive ? 'border-secondary bg-green-50' : 'border-gray-300'}
            `}
          >
            <input {...getAdditionalInputProps()} />
            <div className="flex flex-col items-center">
              <FaCloudUploadAlt className="text-4xl text-secondary mb-2" />
              {isAdditionalDragActive ? (
                <p className="text-secondary">Drop the images here</p>
              ) : (
                <p className="text-gray-600">
                  Drag 'n' drop additional images, or click to select
                </p>
              )}
            </div>
          </div>

          {additionalImages.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {additionalImages.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image.preview} 
                    alt={`Additional Preview ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button 
                    type="button"
                    onClick={() => removeAdditionalImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Add Item
        </button>
      </form>
    </div>
  )
}

export default AddItem
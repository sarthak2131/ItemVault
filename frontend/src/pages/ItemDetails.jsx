import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { 
  FaEnvelope, 
  FaTags, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaArrowLeft 
} from 'react-icons/fa'
import API_URL from '../config.js'

function ItemDetails() {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [enquiryStatus, setEnquiryStatus] = useState({
    loading: false,
    success: false,
    error: null
  })
  const [userEmail, setUserEmail] = useState("")
  const { id } = useParams()

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/items/${id}`)
        setItem(response.data)
        setSelectedImage(`/uploads/${response.data.coverImage}`)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch item details')
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  const handleEnquire = async () => {
    setEnquiryStatus({ loading: true, success: false, error: null })
    try {
      const response = await axios.post(`${API_URL}/api/items/enquiry`, { 
        itemId: id,
        details: item, // Send full item details for email
        email: userEmail // Send user email
      })
      
      if (response.data.success) {
        setEnquiryStatus({ 
          loading: false, 
          success: true, 
          error: null 
        })
        // Optional: Auto-reset success message
        setTimeout(() => {
          setEnquiryStatus({ loading: false, success: false, error: null })
        }, 3000)
      } else {
        throw new Error(response.data.message || 'Enquiry failed')
      }
    } catch (error) {
      console.error('Enquiry failed:', error)
      setEnquiryStatus({ 
        loading: false, 
        success: false, 
        error: error.response?.data?.message || 'Failed to send enquiry' 
      })
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
    </div>
  )

  if (error) return <div className="text-center text-red-500">{error}</div>
  if (!item) return <div>No item found</div>

  const allImages = [item.coverImage, ...item.additionalImages]

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        to="/" 
        className="inline-flex items-center text-gray-600 hover:text-primary mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to Items
      </Link>

      <div className="grid md:grid-cols-2 gap-10 bg-white rounded-xl shadow-lg p-8">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          <div className="bg-gray-100 rounded-xl overflow-hidden h-[500px] flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt={item.itemName} 
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <button 
                key={index} 
                onClick={() => setSelectedImage(`/uploads/${image}`)}
                className={`
                  border-2 rounded-lg overflow-hidden 
                  ${selectedImage === `/uploads/${image}` 
                    ? 'border-primary' 
                    : 'border-transparent hover:border-gray-300'
                  }
                `}
              >
                <img 
                  src={`/uploads/${image}`} 
                  alt={`Thumbnail ${index + 1}`} 
                  className="w-full h-20 object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Item Details Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-primary mb-2">{item.itemName}</h2>
            <div className="flex items-center text-gray-600 space-x-4 mb-4">
              <div className="flex items-center">
                <FaTags className="mr-2 text-secondary" />
                <span>{item.itemType}</span>
              </div>
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-secondary" />
                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="flex items-center text-xl font-semibold text-gray-700 mb-3">
              <FaClipboardList className="mr-2 text-secondary" />
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed">{item.description}</p>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button 
              onClick={handleEnquire}
              disabled={enquiryStatus.loading || !userEmail}
              className={`
                w-full flex items-center justify-center px-6 py-3 rounded-lg transition 
                ${enquiryStatus.loading 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-secondary text-white hover:bg-green-700'
                }
              `}
            >
              {enquiryStatus.loading ? (
                <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
              ) : (
                <>
                  <FaEnvelope className="mr-2" /> 
                  Send Enquiry
                </>
              )}
            </button>

            {/* Status Messages */}
            {enquiryStatus.success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                Enquiry sent successfully!
              </div>
            )}
            {enquiryStatus.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {enquiryStatus.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetails
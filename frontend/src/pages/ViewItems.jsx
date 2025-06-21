import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FaEye, FaTag, FaCalendar } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import API_URL from '../config.js'

const ITEM_TYPES = [
  'Shirt', 
  'Pant', 
  'Shoes', 
  'Sports Gear', 
  'Other'
]

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Name (A-Z)', value: 'nameAsc' },
  { label: 'Name (Z-A)', value: 'nameDesc' }
]

function ViewItems() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [sortOption, setSortOption] = useState('newest')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/items`)
        setItems(response.data)
        setLoading(false)
      } catch (err) {
        console.error('Detailed fetch error:', {
          message: err.message,
          response: err.response,
          config: err.config
        })
        setError('Failed to fetch items: ' + (err.response?.data?.message || err.message))
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const filteredAndSortedItems = useMemo(() => {
    let processedItems = [...items]

    // Filter by item type
    if (filter !== 'All') {
      processedItems = processedItems.filter(item => item.itemType === filter)
    }

    // Search filter
    if (searchQuery) {
      processedItems = processedItems.filter(item => 
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort items
    switch (sortOption) {
      case 'newest':
        processedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'oldest':
        processedItems.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        break
      case 'nameAsc':
        processedItems.sort((a, b) => a.itemName.localeCompare(b.itemName))
        break
      case 'nameDesc':
        processedItems.sort((a, b) => b.itemName.localeCompare(a.itemName))
        break
    }

    return processedItems
  }, [items, filter, sortOption, searchQuery])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div 
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"
          initial={ { rotate: 0 } }
          animate={ { rotate: 360 } }
          transition={ { duration: 1, repeat: Infinity, ease: "linear" } }
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        {/* Search Input */}
        <input 
          type="text" 
          placeholder="Search items..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {/* All Items Button */}
          <button 
            onClick={() => setFilter('All')}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${filter === 'All' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            All Items
          </button>

          {/* Type-specific Filter Buttons */}
          {ITEM_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${filter === type 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex justify-end">
          <select 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>No items found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={ {
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { 
                delayChildren: 0.2,
                staggerChildren: 0.1 
              }
            }
          } }
        >
          <AnimatePresence>
            {filteredAndSortedItems.map((item) => (
              <motion.div
                key={item._id}
                variants={ {
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 }
                } }
                whileHover={ { scale: 1.05 } }
                transition={ { type: "spring", stiffness: 300 } }
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <Link to={`/item/${item._id}`}>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={`/uploads/${item.coverImage}`} 
                      alt={item.itemName} 
                      className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-primary truncate">{item.itemName}</h3>
                    <div className="flex items-center text-gray-500 space-x-2 mt-2">
                      <FaTag className="text-secondary" />
                      <span className="text-sm">{item.itemType}</span>
                      <FaCalendar className="ml-2 text-secondary" />
                      <span className="text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-primary">
                      <FaEye className="mr-2" />
                      <span className="text-sm">View Details</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

export default ViewItems
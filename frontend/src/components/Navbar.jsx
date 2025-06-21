import React from 'react'
import { Link } from 'react-router-dom'
import { FaHome, FaPlus } from 'react-icons/fa'

function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-primary">
          <FaHome className="text-2xl" />
          <span className="font-bold">View Items</span>
        </Link>
        <Link 
          to="/add-item" 
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
        >
          <FaPlus />
          <span>Add New Item</span>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
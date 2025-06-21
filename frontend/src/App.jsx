import React from 'react'
import { 
  BrowserRouter, 
  Routes, 
  Route 
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import ViewItems from './pages/ViewItems'
import AddItem from './pages/AddItem'
import ItemDetails from './pages/ItemDetails'

function App() {
  return (
    <BrowserRouter 
      future={ {
        v7_startTransition: true,
        v7_relativeSplatPath: true
      } }
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ViewItems />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/item/:id" element={<ItemDetails />} />
          </Routes>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: '#10B981', // secondary color
                color: 'white',
              },
            },
            error: {
              style: {
                background: '#EF4444', // red for errors
                color: 'white',
              },
            },
            loading: {
              style: {
                background: '#3B82F6', // primary color
                color: 'white',
              },
            },
          }}
        />
      </div>
    </BrowserRouter>
  )
}

export default App
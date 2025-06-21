import express from 'express';
import multer from 'multer';
import path from 'path';
import Item from '../models/Item.js';
import { sendEnquiryEmail } from '../services/emailService.js';
import { fileURLToPath } from 'url';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'itemvault',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

const upload = multer({ storage });

// Existing routes...

// New Enquiry Route with Comprehensive Error Handling
router.post('/enquiry', async (req, res) => {
  try {
    const { itemId, details, email } = req.body;

    // Validate input
    if (!itemId) {
      return res.status(400).json({ 
        message: 'Item ID is required',
        success: false
      });
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({
        message: 'A valid email is required',
        success: false
      });
    }

    // Find item with error handling
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ 
        message: 'Item not found',
        success: false 
      });
    }

    // Send enquiry email
    const emailSent = await sendEnquiryEmail(details || item, email);
    
    if (emailSent) {
      res.status(200).json({ 
        message: 'Enquiry sent successfully',
        success: true 
      });
    } else {
      res.status(500).json({ 
        message: 'Failed to send enquiry. Please try again later.',
        success: false 
      });
    }
  } catch (error) {
    console.error('Enquiry route error:', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({ 
      message: 'Internal server error. Please try again later.',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error: error.message });
  }
});

// Get a single item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
});

// Add new item (with file upload)
router.post('/', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const { itemName, itemType, description } = req.body;
    if (!itemName || !itemType || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!req.files['coverImage'] || req.files['coverImage'].length === 0) {
      return res.status(400).json({ message: 'Cover image is required' });
    }
    
    // Get Cloudinary URLs
    const coverImage = req.files['coverImage'][0].path;
    const additionalImages = req.files['additionalImages']
      ? req.files['additionalImages'].map(file => file.path)
      : [];
    
    const newItem = new Item({
      itemName,
      itemType,
      description,
      coverImage,
      additionalImages
    });
    await newItem.save();
    res.status(201).json({ message: 'Item added successfully', item: newItem });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Failed to add item', error: error.message });
  }
});

export default router;
import express from 'express';
import multer from 'multer';
import path from 'path';
import Item from '../models/Item.js';
import { sendEnquiryEmail } from '../services/emailService.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

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

// Multer storage configuration for cover and additional images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

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
    const coverImage = req.files['coverImage'][0].filename;
    const additionalImages = req.files['additionalImages']
      ? req.files['additionalImages'].map(file => file.filename)
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
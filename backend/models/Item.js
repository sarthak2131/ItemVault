import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  itemName: { 
    type: String, 
    required: true,
    trim: true
  },
  itemType: { 
    type: String, 
    required: true,
    enum: ['Shirt', 'Pant', 'Shoes', 'Sports Gear', 'Other']
  },
  description: { 
    type: String, 
    required: true 
  },
  coverImage: { 
    type: String, 
    required: true 
  },
  additionalImages: [{ 
    type: String 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Item', ItemSchema);
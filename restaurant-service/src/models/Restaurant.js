const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      maxlength: [120, 'Restaurant name cannot exceed 120 characters'],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Owner id is required'],
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [30, 'Phone number cannot exceed 30 characters'],
    },
    cuisine: {
      type: [String],
      default: [],
      set: (items) =>
        Array.isArray(items)
          ? items.map((item) => String(item).trim()).filter(Boolean)
          : [],
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be greater than 5'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

restaurantSchema.index({ name: 'text', address: 'text', cuisine: 'text' });

module.exports = mongoose.model('Restaurant', restaurantSchema);

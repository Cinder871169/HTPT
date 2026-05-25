const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant id is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Menu item name is required'],
      trim: true,
      maxlength: [120, 'Menu item name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [80, 'Category cannot exceed 80 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
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

menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ restaurantId: 1, name: 1 }, { unique: true });

menuItemSchema.pre('save', function setAvailability(next) {
  if (this.stock <= 0) {
    this.stock = 0;
    this.isAvailable = false;
  }
  next();
});

module.exports = mongoose.model('MenuItem', menuItemSchema);

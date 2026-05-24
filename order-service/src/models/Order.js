const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../shared/constants');

const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { 
    type: Number, 
    required: true,
    min: [1, 'Số lượng phải lớn hơn 0']
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Giá không được âm']
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true // Đánh index để truy vấn đơn hàng của user nhanh hơn
  },
  restaurantId: { 
    type: String, 
    required: true,
    index: true // Đánh index để truy vấn đơn hàng của nhà hàng
  },
  items: {
    type: [orderItemSchema],
    validate: [v => v.length > 0, 'Đơn hàng phải có ít nhất 1 món ăn']
  },
  totalAmount: { 
    type: Number, 
    required: true,
    min: [0, 'Tổng tiền không hợp lệ']
  },
  status: { 
    type: String, 
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING 
  },
  deliveryAddress: { 
    type: String, 
    required: true 
  },
  note: { 
    type: String,
    trim: true,
    maxLength: 500 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);
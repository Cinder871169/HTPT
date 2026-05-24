const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../shared/constants');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true // Tối ưu query khi user lấy danh sách thông báo
  },
  orderId: { 
    type: String 
  },
  type: { 
    type: String, 
    enum: Object.values(NOTIFICATION_TYPES),
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Notification', notificationSchema);
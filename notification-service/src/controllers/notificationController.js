const Notification = require('../models/Notification');
const { createLogger } = require('../shared/logger');

const logger = createLogger('notification-controller');

// [GET] Lấy danh sách thông báo của User
exports.getUserNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Đếm số thông báo chưa đọc
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      success: true,
      data: notifications,
      meta: {
        unreadCount,
        page,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

// [PUT] Đánh dấu 1 thông báo là đã đọc
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

// [PUT] Đánh dấu tất cả thông báo của 1 User là đã đọc
exports.markAllAsRead = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'Đã đánh dấu đọc tất cả' });
  } catch (error) {
    next(error);
  }
};
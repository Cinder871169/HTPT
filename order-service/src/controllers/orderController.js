const Order = require('../models/Order');
const { publishMessage } = require('../shared/kafka');
const constants = require('../shared/constants');
const { createLogger } = require('../shared/logger');

const logger = createLogger('order-controller');

// [POST] Tạo đơn hàng mới
exports.createOrder = async (req, res, next) => {
  try {
    const { restaurantId, items, totalAmount, deliveryAddress, note } = req.body;
    const userId = req.headers['x-user-id'] || req.body.userId;

    const newOrder = new Order({
      userId,
      restaurantId,
      items,
      totalAmount,
      deliveryAddress,
      note,
      status: constants.ORDER_STATUS.PENDING
    });
    
    await newOrder.save();
    logger.info(`Tạo đơn hàng thành công: ${newOrder._id} (User: ${userId})`);

    // Publish event ORDER_CREATED
    await publishMessage(
      null, 
      constants.KAFKA.TOPICS.ORDER_EVENTS,
      constants.KAFKA.EVENT_TYPES.ORDER_CREATED,
      newOrder
    );

    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      data: newOrder
    });
  } catch (error) {
    logger.error('Lỗi khi tạo đơn hàng:', error);
    next(error);
  }
};

// [GET] Lấy đơn hàng của user hiện tại (từ header x-user-id)
exports.getMyOrders = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Không xác định được người dùng' });
    }
    req.params.userId = userId;
    return exports.getUserOrders(req, res, next);
  } catch (error) {
    next(error);
  }
};

// [GET] Lấy danh sách đơn hàng của một User
exports.getUserOrders = async (req, res, next) => {
  try {
    const { userId } = req.params;
    // Hỗ trợ pagination đơn giản
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Order.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Lấy danh sách đơn hàng của một Nhà hàng
exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// [GET] Chi tiết một đơn hàng
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// [PUT] Cập nhật trạng thái đơn hàng (Dành cho Admin/Nhà hàng)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!Object.values(constants.ORDER_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
    }

    const order = await Order.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    logger.info(`Cập nhật trạng thái đơn hàng ${id} -> ${status}`);

    // Publish event ORDER_STATUS_CHANGED
    await publishMessage(
      null,
      constants.KAFKA.TOPICS.ORDER_EVENTS,
      constants.KAFKA.EVENT_TYPES.ORDER_STATUS_CHANGED,
      order
    );

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// [PUT] Hủy đơn hàng (Dành cho User hoặc Hệ thống)
exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }

    // Chỉ cho phép hủy khi đang PENDING hoặc CONFIRMED
    if (order.status !== constants.ORDER_STATUS.PENDING && order.status !== constants.ORDER_STATUS.CONFIRMED) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không thể hủy đơn hàng ở trạng thái hiện tại' 
      });
    }

    order.status = constants.ORDER_STATUS.CANCELLED;
    await order.save();

    logger.info(`Đã hủy đơn hàng ${id}`);

    // Publish event ORDER_CANCELLED để Restaurant hoàn stock và Notification báo tin
    await publishMessage(
      null,
      constants.KAFKA.TOPICS.ORDER_EVENTS,
      constants.KAFKA.EVENT_TYPES.ORDER_CANCELLED,
      order
    );

    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: order
    });
  } catch (error) {
    next(error);
  }
};
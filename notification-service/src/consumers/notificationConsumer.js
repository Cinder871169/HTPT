const Notification = require('../models/Notification');
const constants = require('../shared/constants');
const { startConsumer } = require('../shared/kafka');
const { createLogger } = require('../shared/logger');

const logger = createLogger('notification-consumer');

const handleOrderEvents = async (eventType, data, message) => {
  try {
    let title = '';
    let bodyMessage = '';
    let notifType = constants.NOTIFICATION_TYPES.SYSTEM;

    // data chính là payload (đơn hàng) mà Order Service gửi qua Kafka
    switch (eventType) {
      case constants.KAFKA.EVENT_TYPES.ORDER_CREATED:
        title = 'Đơn hàng mới được tạo thành công 🎉';
        bodyMessage = `Đơn hàng #${data._id} trị giá ${data.totalAmount.toLocaleString('vi-VN')}đ đang chờ xác nhận.`;
        notifType = constants.NOTIFICATION_TYPES.ORDER_CREATED;
        break;

      case constants.KAFKA.EVENT_TYPES.ORDER_STATUS_CHANGED:
        title = 'Cập nhật trạng thái đơn hàng 🚀';
        bodyMessage = `Đơn hàng #${data._id} của bạn đã chuyển sang trạng thái: ${data.status.toUpperCase()}.`;
        notifType = constants.NOTIFICATION_TYPES.ORDER_STATUS;
        break;

      case constants.KAFKA.EVENT_TYPES.ORDER_CANCELLED:
        title = 'Đơn hàng đã bị hủy ❌';
        bodyMessage = `Rất tiếc, đơn hàng #${data._id} của bạn đã bị hủy.`;
        notifType = constants.NOTIFICATION_TYPES.ORDER_CANCELLED;
        break;

      default:
        logger.warn(`Bỏ qua eventType không hỗ trợ: ${eventType}`);
        return;
    }

    // Khởi tạo và lưu thông báo
    const notification = new Notification({
      userId: data.userId,
      orderId: data._id,
      type: notifType,
      title,
      message: bodyMessage,
    });

    await notification.save();
    logger.info(`Da tao thong bao tu dong cho User [${data.userId}] - Su kien: ${eventType}`);

  } catch (error) {
    logger.error('Loi khi xu ly event va luu thong bao:', error);
  }
};

const initNotificationConsumer = async () => {
  logger.info('Bắt đầu khởi tạo Kafka Consumer cho Notification Service...');
  await startConsumer(
    constants.KAFKA.GROUPS.NOTIFICATION, // "notification-group"
    constants.KAFKA.TOPICS.ORDER_EVENTS,  // "order-events"
    handleOrderEvents
  );
};

module.exports = { initNotificationConsumer };
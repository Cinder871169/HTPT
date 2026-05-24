const { createLogger } = require('../shared/logger');
const logger = createLogger('order-error-handler');

module.exports = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: Object.values(err.errors).map(val => val.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID không đúng định dạng'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Lỗi máy chủ nội bộ'
  });
};
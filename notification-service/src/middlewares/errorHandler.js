const { createLogger } = require('../shared/logger');
const logger = createLogger('notification-error-handler');

module.exports = (err, req, res, next) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });
  res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
};
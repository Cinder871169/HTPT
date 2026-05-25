const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const constants = require('../shared/constants');
const { startConsumer } = require('../shared/kafka');
const { createLogger } = require('../shared/logger');

const logger = createLogger('restaurant-order-consumer');

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => ({
      menuItemId: item.menuItemId,
      quantity: Number(item.quantity),
    }))
    .filter(
      (item) =>
        mongoose.Types.ObjectId.isValid(item.menuItemId) &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0,
    );
}

async function adjustStock(order, direction) {
  const items = normalizeItems(order.items);

  if (!items.length) {
    logger.warn(`Order ${order._id || 'unknown'} has no valid menu items to adjust`);
    return;
  }

  const operations = items.map((item) => {
    const quantityChange = direction * item.quantity;
    const filter =
      direction < 0
        ? { _id: item.menuItemId, stock: { $gte: item.quantity } }
        : { _id: item.menuItemId };

    const update =
      direction < 0
        ? { $inc: { stock: quantityChange } }
        : { $inc: { stock: quantityChange }, $set: { isAvailable: true } };

    return {
      updateOne: {
        filter,
        update,
      },
    };
  });

  const result = await MenuItem.bulkWrite(operations, { ordered: false });
  const ids = items.map((item) => item.menuItemId);

  await MenuItem.updateMany(
    { _id: { $in: ids }, stock: { $lte: 0 } },
    { $set: { stock: 0, isAvailable: false } },
  );

  if (direction < 0 && result.modifiedCount < operations.length) {
    logger.warn(`Some stock updates were skipped for order ${order._id || 'unknown'}`, {
      expected: operations.length,
      modified: result.modifiedCount,
    });
  }

  logger.info(`Adjusted stock for order ${order._id || 'unknown'}`, {
    direction,
    modified: result.modifiedCount,
  });
}

async function handleOrderEvent(eventType, data) {
  switch (eventType) {
    case constants.KAFKA.EVENT_TYPES.ORDER_CREATED:
      await adjustStock(data, -1);
      break;

    case constants.KAFKA.EVENT_TYPES.ORDER_CANCELLED:
      await adjustStock(data, 1);
      break;

    default:
      logger.info(`Ignoring unsupported order event: ${eventType}`);
  }
}

async function initOrderConsumer() {
  logger.info('Starting Restaurant Service order consumer');
  await startConsumer(constants.KAFKA.GROUPS.RESTAURANT, constants.KAFKA.TOPICS.ORDER_EVENTS, handleOrderEvent);
}

module.exports = {
  initOrderConsumer,
};

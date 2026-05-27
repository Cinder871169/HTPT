const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Tạo đơn hàng
router.post('/', orderController.createOrder);

// Frontend-compatible routes (userId from header)
router.get('/', orderController.getMyOrders);
router.delete('/:id', orderController.cancelOrder);

// Lấy danh sách theo đối tượng
router.get('/user/:userId', orderController.getUserOrders);
router.get('/restaurant/:restaurantId', orderController.getRestaurantOrders);

// Tương tác với một đơn hàng cụ thể
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/cancel', orderController.cancelOrder);

module.exports = router;
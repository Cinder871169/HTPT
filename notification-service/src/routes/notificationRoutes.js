const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Frontend-compatible routes (userId from header)
router.get('/', notificationController.getMyNotifications);
router.put('/read-all', notificationController.markAllAsReadByHeader);

router.get('/user/:userId', notificationController.getUserNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/user/:userId/read-all', notificationController.markAllAsRead);

module.exports = router;
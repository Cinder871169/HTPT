const express = require('express');
const restaurantController = require('../controllers/restaurantController');

const router = express.Router();

router.post('/api/restaurants', restaurantController.createRestaurant);
router.get('/api/restaurants', restaurantController.getRestaurants);
router.get('/api/restaurants/:id', restaurantController.getRestaurantById);
router.put('/api/restaurants/:id', restaurantController.updateRestaurant);
router.delete('/api/restaurants/:id', restaurantController.deleteRestaurant);

router.post('/api/restaurants/:id/menu', restaurantController.addMenuItem);
router.get('/api/restaurants/:id/menu', restaurantController.getMenu);

router.put('/api/menu-items/:id', restaurantController.updateMenuItem);
router.delete('/api/menu-items/:id', restaurantController.deleteMenuItem);

module.exports = router;

const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const { createLogger } = require('../shared/logger');

const logger = createLogger('restaurant-controller');

const OWNER_ROLE = 'restaurant_owner';
const ADMIN_ROLE = 'admin';

function getIdentity(req) {
  return {
    userId: req.headers['x-user-id'],
    role: req.headers['x-user-role'],
    email: req.headers['x-user-email'],
  };
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function normalizeCuisine(cuisine) {
  if (!cuisine) return [];
  if (Array.isArray(cuisine)) {
    return cuisine.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(cuisine)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function canCreateRestaurant(identity) {
  return identity.role === OWNER_ROLE || identity.role === ADMIN_ROLE;
}

function canManageRestaurant(identity, restaurant) {
  if (!identity.userId) return false;
  if (identity.role === ADMIN_ROLE) return true;
  return (
    identity.role === OWNER_ROLE &&
    restaurant.ownerId &&
    restaurant.ownerId.toString() === identity.userId
  );
}

function forbidden(res) {
  return res.status(403).json({
    success: false,
    message: 'You do not have permission to manage this restaurant',
  });
}

exports.createRestaurant = async (req, res, next) => {
  try {
    const identity = getIdentity(req);

    if (!canCreateRestaurant(identity)) {
      return forbidden(res);
    }

    const ownerId =
      identity.role === ADMIN_ROLE && req.body.ownerId ? req.body.ownerId : identity.userId;

    if (!isValidObjectId(ownerId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid ownerId is required',
      });
    }

    const restaurant = await Restaurant.create({
      name: req.body.name,
      ownerId,
      address: req.body.address,
      phone: req.body.phone,
      cuisine: normalizeCuisine(req.body.cuisine),
    });

    logger.info(`Restaurant created: ${restaurant._id}`);

    return res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getRestaurants = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.isActive !== 'all') {
      filter.isActive = req.query.isActive === 'false' ? false : true;
    }

    if (req.query.cuisine) {
      filter.cuisine = {
        $in: normalizeCuisine(req.query.cuisine).map(
          (item) => new RegExp(`^${escapeRegExp(item)}$`, 'i'),
        ),
      };
    }

    if (req.query.q) {
      const q = new RegExp(escapeRegExp(req.query.q.trim()), 'i');
      filter.$or = [{ name: q }, { address: q }, { cuisine: q }];
    }

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Restaurant.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: restaurants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    if (!canManageRestaurant(getIdentity(req), restaurant)) {
      return forbidden(res);
    }

    const allowedFields = ['name', 'address', 'phone', 'rating', 'isActive'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        restaurant[field] = req.body[field];
      }
    });

    if (req.body.cuisine !== undefined) {
      restaurant.cuisine = normalizeCuisine(req.body.cuisine);
    }

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      data: restaurant,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    if (!canManageRestaurant(getIdentity(req), restaurant)) {
      return forbidden(res);
    }

    restaurant.isActive = false;
    await restaurant.save();

    await MenuItem.updateMany(
      { restaurantId: restaurant._id },
      { $set: { isAvailable: false } },
    );

    return res.status(200).json({
      success: true,
      message: 'Restaurant disabled successfully',
    });
  } catch (error) {
    return next(error);
  }
};

exports.addMenuItem = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    if (!canManageRestaurant(getIdentity(req), restaurant)) {
      return forbidden(res);
    }

    const menuItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      imageUrl: req.body.imageUrl,
      isAvailable: req.body.isAvailable,
      stock: req.body.stock,
    });

    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: menuItem,
    });
  } catch (error) {
    return next(error);
  }
};

exports.getMenu = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    const filter = { restaurantId: restaurant._id };
    const identity = getIdentity(req);
    const includeUnavailable =
      req.query.includeUnavailable === 'true' && canManageRestaurant(identity, restaurant);

    if (!includeUnavailable) {
      filter.isAvailable = true;
    }

    if (req.query.category) {
      filter.category = new RegExp(`^${escapeRegExp(req.query.category.trim())}$`, 'i');
    }

    const menuItems = await MenuItem.find(filter).sort({ category: 1, name: 1 });

    return res.status(200).json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found for this menu item',
      });
    }

    if (!canManageRestaurant(getIdentity(req), restaurant)) {
      return forbidden(res);
    }

    const allowedFields = [
      'name',
      'description',
      'price',
      'category',
      'imageUrl',
      'isAvailable',
      'stock',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        menuItem[field] = req.body[field];
      }
    });

    await menuItem.save();

    return res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      data: menuItem,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
    }

    const restaurant = await Restaurant.findById(menuItem.restaurantId);

    if (!restaurant || !canManageRestaurant(getIdentity(req), restaurant)) {
      return forbidden(res);
    }

    await menuItem.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

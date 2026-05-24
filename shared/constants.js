module.exports = {
  KAFKA: {
    CLIENT_ID: "food-ordering-app",
    BROKERS: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
    TOPICS: {
      ORDER_EVENTS: "order-events",
    },
    GROUPS: {
      RESTAURANT: "restaurant-group",
      NOTIFICATION: "notification-group",
    },
    EVENT_TYPES: {
      ORDER_CREATED: "ORDER_CREATED",
      ORDER_STATUS_CHANGED: "ORDER_STATUS_CHANGED",
      ORDER_CANCELLED: "ORDER_CANCELLED",
    },
  },
  // User Roles
  ROLES: {
    CUSTOMER: "customer",
    RESTAURANT_OWNER: "restaurant_owner",
    ADMIN: "admin",
  },
  // Order Status
  ORDER_STATUS: {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    PREPARING: "preparing",
    DELIVERING: "delivering",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
  },
  // Notification
  NOTIFICATION_TYPES: {
    ORDER_CREATED: "order_created",
    ORDER_STATUS: "order_status",
    ORDER_CANCELLED: "order_cancelled",
    SYSTEM: "system",
  },
  // Service URLs
  SERVICES: {
    USER: process.env.USER_SERVICE_URL || "http://localhost:3001",
    RESTAURANT: process.env.RESTAURANT_SERVICE_URL || "http://localhost:3002",
    ORDER: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
    NOTIFICATION:
      process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004",
  },
};

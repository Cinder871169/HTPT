const SERVICES = {
  USER: process.env.USER_SERVICE_URL || "http://localhost:3001",
  RESTAURANT: process.env.RESTAURANT_SERVICE_URL || "http://localhost:3002",
  ORDER: process.env.ORDER_SERVICE_URL || "http://localhost:3003",
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004",
};

const PROXY_CONFIG = [
  {
    context: ["/api/auth"],
    target: SERVICES.USER,
    auth: false,
  },
  {
    context: ["/api/users"],
    target: SERVICES.USER,
    auth: true,
  },
  {
    context: ["/api/restaurants", "/api/menu-items"],
    target: SERVICES.RESTAURANT,
    auth: "mixed",
  },
  {
    context: ["/api/orders"],
    target: SERVICES.ORDER,
    auth: true,
  },
  {
    context: ["/api/notifications"],
    target: SERVICES.NOTIFICATION,
    auth: true,
  },
];

module.exports = {
  SERVICES,
  PROXY_CONFIG,
};

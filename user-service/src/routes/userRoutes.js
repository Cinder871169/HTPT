const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const authorize = require("../middleware/authorize");

const router = express.Router();

// ── Auth Verification Endpoint for Nginx auth_request (Public) ───────
router.get("/api/auth/verify", userController.verifyToken);

// ── Auth Endpoints (Public) ──────────────────────────────────────────
router.post(
  "/api/auth/register",
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Please include a valid email address").isEmail(),
    body(
      "password",
      "Please enter a password with 6 or more characters",
    ).isLength({ min: 6 }),
  ],
  userController.register,
);

router.post(
  "/api/auth/login",
  [
    body("email", "Please include a valid email address").isEmail(),
    body("password", "Password is required").exists(),
  ],
  userController.login,
);

// ── Customer Profile (Auth required via Gateway, checked via authorize) ────
router.get(
  "/api/users/profile",
  authorize("customer", "restaurant_owner", "admin"),
  userController.getProfile,
);
router.put(
  "/api/users/profile",
  authorize("customer", "restaurant_owner", "admin"),
  userController.updateProfile,
);

// ── Admin-Only User Management Endpoints ──────────────────────────────
router.get("/api/users", authorize("admin"), userController.getAllUsers);
router.get("/api/users/:id", authorize("admin"), userController.getUserById);

router.put(
  "/api/users/:id/role",
  [
    authorize("admin"),
    body(
      "role",
      "Valid role is required (customer, restaurant_owner, admin)",
    ).isIn(["customer", "restaurant_owner", "admin"]),
  ],
  userController.updateUserRole,
);

router.delete("/api/users/:id", authorize("admin"), userController.deleteUser);

module.exports = router;

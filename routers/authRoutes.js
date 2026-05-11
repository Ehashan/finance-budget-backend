const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { register, login, getMe, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email")
    .isEmail().withMessage("Please enter a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes (require Bearer token)
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);

module.exports = router;

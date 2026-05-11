const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  seedCategories,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// All routes require authentication
router.use(protect);

router.post("/seed", seedCategories);          // POST   /api/categories/seed
router.get("/", getCategories);                // GET    /api/categories?type=income
router.post("/", createCategory);             // POST   /api/categories
router.put("/:id", updateCategory);           // PUT    /api/categories/:id
router.delete("/:id", deleteCategory);        // DELETE /api/categories/:id

module.exports = router;

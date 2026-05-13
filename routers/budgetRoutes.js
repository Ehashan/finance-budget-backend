const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
} = require("../controllers/budgetController");

// All routes protected
router.use(protect);

router.get("/",     getBudgets);        // GET    /api/budgets?month=5&year=2025
router.get("/:id",  getBudgetById);     // GET    /api/budgets/:id
router.post("/",    createBudget);      // POST   /api/budgets
router.put("/:id",  updateBudget);      // PUT    /api/budgets/:id
router.delete("/:id", deleteBudget);   // DELETE /api/budgets/:id

module.exports = router;

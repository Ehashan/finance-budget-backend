const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getCategorySummary,
} = require("../controllers/transactionController");

// All routes require authentication
router.use(protect);

// Summary / analytics routes (must be before /:id)
router.get("/summary/monthly", getMonthlySummary);        // GET /api/transactions/summary/monthly?year=2025
router.get("/summary/by-category", getCategorySummary);  // GET /api/transactions/summary/by-category?type=expense

// CRUD routes
router.get("/", getTransactions);             // GET    /api/transactions?type=expense&category=id&startDate=...
router.get("/:id", getTransactionById);       // GET    /api/transactions/:id
router.post("/", createTransaction);          // POST   /api/transactions
router.put("/:id", updateTransaction);        // PUT    /api/transactions/:id
router.delete("/:id", deleteTransaction);     // DELETE /api/transactions/:id

module.exports = router;

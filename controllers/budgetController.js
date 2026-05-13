const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");

// Helper: calculate total spent for a category in a given month/year
const getSpentAmount = async (userId, categoryId, month, year) => {
  const start = new Date(year, month - 1, 1);         // first day of month
  const end   = new Date(year, month, 0, 23, 59, 59); // last day of month

  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        category: categoryId,
        type: "expense",
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$amount" },
      },
    },
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// @route   GET /api/budgets
// @access  Private
// Returns all budgets for the current month with spent amount and status
const getBudgets = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year })
      .populate("category", "name type color icon");

    // Attach spent amount and over-budget flag to each budget
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const spent      = await getSpentAmount(req.user._id, budget.category._id, month, year);
        const remaining  = budget.amount - spent;
        const percentage = Math.min((spent / budget.amount) * 100, 100).toFixed(1);
        const isOverBudget = spent > budget.amount;

        return {
          _id:         budget._id,
          category:    budget.category,
          amount:      budget.amount,
          period:      budget.period,
          month:       budget.month,
          year:        budget.year,
          spent:       parseFloat(spent.toFixed(2)),
          remaining:   parseFloat(remaining.toFixed(2)),
          percentage:  parseFloat(percentage),
          isOverBudget,
          createdAt:   budget.createdAt,
        };
      })
    );

    res.json({ month, year, budgets: budgetsWithProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/budgets/:id
// @access  Private
const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("category", "name type color icon");

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const spent      = await getSpentAmount(req.user._id, budget.category._id, budget.month, budget.year);
    const remaining  = budget.amount - spent;
    const percentage = Math.min((spent / budget.amount) * 100, 100).toFixed(1);

    res.json({
      budget: {
        ...budget.toObject(),
        spent:       parseFloat(spent.toFixed(2)),
        remaining:   parseFloat(remaining.toFixed(2)),
        percentage:  parseFloat(percentage),
        isOverBudget: spent > budget.amount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, amount, period, month, year } = req.body;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear  = new Date().getFullYear();

    const budget = await Budget.create({
      user:     req.user._id,
      category,
      amount,
      period:   period || "monthly",
      month:    month  || currentMonth,
      year:     year   || currentYear,
    });

    const populated = await budget.populate("category", "name type color icon");

    res.status(201).json({ message: "Budget created", budget: populated });
  } catch (error) {
    // Duplicate key = budget already exists for this category/month
    if (error.code === 11000) {
      return res.status(400).json({
        message: "A budget already exists for this category in the selected month",
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    const { amount, period } = req.body;
    if (amount !== undefined) budget.amount = amount;
    if (period !== undefined) budget.period = period;

    const updated   = await budget.save();
    const populated = await updated.populate("category", "name type color icon");

    const spent      = await getSpentAmount(req.user._id, populated.category._id, populated.month, populated.year);
    const remaining  = populated.amount - spent;
    const percentage = Math.min((spent / populated.amount) * 100, 100).toFixed(1);

    res.json({
      message: "Budget updated",
      budget: {
        ...populated.toObject(),
        spent:       parseFloat(spent.toFixed(2)),
        remaining:   parseFloat(remaining.toFixed(2)),
        percentage:  parseFloat(percentage),
        isOverBudget: spent > populated.amount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    await budget.deleteOne();
    res.json({ message: "Budget deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
};

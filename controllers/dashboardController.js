const Transaction = require("../models/Transaction");
const Budget      = require("../models/Budget");
const Category    = require("../models/Category");

// @route   GET /api/dashboard
// @access  Private
// Returns everything the frontend dashboard needs in a single call
const getDashboard = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth   = new Date(year, month, 0, 23, 59, 59);

    // ── 1. Financial summary for selected month ──────────────────────────────
    const summaryAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id:          "$type",
          total:        { $sum: "$amount" },
          count:        { $sum: 1 },
        },
      },
    ]);

    let totalIncome  = 0;
    let totalExpense = 0;
    let incomeCount  = 0;
    let expenseCount = 0;

    summaryAgg.forEach(({ _id, total, count }) => {
      if (_id === "income")  { totalIncome  = total; incomeCount  = count; }
      if (_id === "expense") { totalExpense = total; expenseCount = count; }
    });

    // ── 2. Monthly income vs expense for bar chart (full year) ───────────────
    const monthlyAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id:   { month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month:   i + 1,
      income:  0,
      expense: 0,
    }));

    monthlyAgg.forEach(({ _id, total }) => {
      monthlyData[_id.month - 1][_id.type] = parseFloat(total.toFixed(2));
    });

    // ── 3. Expense breakdown by category (for pie chart) ─────────────────────
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: "expense",
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id:   "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from:         "categories",
          localField:   "_id",
          foreignField: "_id",
          as:           "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id:      0,
          name:     "$category.name",
          color:    "$category.color",
          icon:     "$category.icon",
          total:    { $round: ["$total", 2] },
          count:    1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    // ── 4. Budget progress for current month ─────────────────────────────────
    const budgets = await Budget.find({
      user: req.user._id,
      month,
      year,
    }).populate("category", "name color icon");

    const budgetProgress = await Promise.all(
      budgets.map(async (b) => {
        const spentAgg = await Transaction.aggregate([
          {
            $match: {
              user:     req.user._id,
              category: b.category._id,
              type:     "expense",
              date:     { $gte: startOfMonth, $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const spent      = spentAgg.length > 0 ? spentAgg[0].total : 0;
        const percentage = b.amount > 0
          ? parseFloat(Math.min((spent / b.amount) * 100, 100).toFixed(1))
          : 0;

        return {
          _id:          b._id,
          category:     b.category,
          budgetAmount: b.amount,
          spent:        parseFloat(spent.toFixed(2)),
          remaining:    parseFloat((b.amount - spent).toFixed(2)),
          percentage,
          isOverBudget: spent > b.amount,
        };
      })
    );

    // ── 5. Recent 5 transactions ──────────────────────────────────────────────
    const recentTransactions = await Transaction.find({ user: req.user._id })
      .populate("category", "name color icon type")
      .sort({ date: -1 })
      .limit(5);

    // ── 6. All-time balance ───────────────────────────────────────────────────
    const allTimeAgg = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id:           "$type",
          total:         { $sum: "$amount" },
        },
      },
    ]);

    let allTimeIncome  = 0;
    let allTimeExpense = 0;
    allTimeAgg.forEach(({ _id, total }) => {
      if (_id === "income")  allTimeIncome  = total;
      if (_id === "expense") allTimeExpense = total;
    });

    // ── Response ──────────────────────────────────────────────────────────────
    res.json({
      period: { month, year },

      summary: {
        totalIncome:   parseFloat(totalIncome.toFixed(2)),
        totalExpense:  parseFloat(totalExpense.toFixed(2)),
        balance:       parseFloat((totalIncome - totalExpense).toFixed(2)),
        incomeCount,
        expenseCount,
        allTimeBalance: parseFloat((allTimeIncome - allTimeExpense).toFixed(2)),
      },

      monthlyData,        // 12-month bar chart data
      categoryBreakdown:  categoryAgg,   // pie chart data
      budgetProgress,     // budget vs actual
      recentTransactions, // latest 5 transactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard };

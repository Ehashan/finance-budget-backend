const Transaction = require("../models/Transaction");

// @route   GET /api/transactions
// @access  Private
// Supports filters: ?type=income&category=id&startDate=2024-01-01&endDate=2024-12-31
const getTransactions = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;

    const filter = { user: req.user._id };

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // include entire end day
        filter.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(filter)
      .populate("category", "name type color icon")
      .sort({ date: -1 }); // newest first

    // Calculate summary
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      count: transactions.length,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("category", "name type color icon");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, date, note } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount,
      type,
      category,
      date: date || Date.now(),
      note: note || "",
    });

    const populated = await transaction.populate("category", "name type color icon");

    res.status(201).json({
      message: "Transaction created",
      transaction: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const { title, amount, type, category, date, note } = req.body;

    if (title !== undefined) transaction.title = title;
    if (amount !== undefined) transaction.amount = amount;
    if (type !== undefined) transaction.type = type;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined) transaction.date = date;
    if (note !== undefined) transaction.note = note;

    const updated = await transaction.save();
    const populated = await updated.populate("category", "name type color icon");

    res.json({ message: "Transaction updated", transaction: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await transaction.deleteOne();
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/transactions/summary/monthly
// @access  Private
// Returns monthly income vs expense totals for charts
const getMonthlySummary = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const summary = await Transaction.aggregate([
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
          _id: {
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // Format into 12-month array
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    summary.forEach(({ _id, total }) => {
      months[_id.month - 1][_id.type] = total;
    });

    res.json({ year, months });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/transactions/summary/by-category
// @access  Private
// Returns expense totals per category (for pie chart)
const getCategorySummary = async (req, res) => {
  try {
    const { startDate, endDate, type = "expense" } = req.query;

    const match = { user: req.user._id, type };
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }

    const summary = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: "$category.name",
          color: "$category.color",
          icon: "$category.icon",
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ type, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getMonthlySummary,
  getCategorySummary,
};

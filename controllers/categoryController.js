const Category = require("../models/Category");

// Default categories to seed for new users
const defaultCategories = [
  // Income
  { name: "Salary",       type: "income",  color: "#22c55e", icon: "briefcase" },
  { name: "Freelance",    type: "income",  color: "#10b981", icon: "laptop" },
  { name: "Investments",  type: "income",  color: "#06b6d4", icon: "trending-up" },
  { name: "Other Income", type: "income",  color: "#84cc16", icon: "plus-circle" },
  // Expense
  { name: "Food",         type: "expense", color: "#f97316", icon: "coffee" },
  { name: "Transport",    type: "expense", color: "#f59e0b", icon: "car" },
  { name: "Rent",         type: "expense", color: "#ef4444", icon: "home" },
  { name: "Entertainment",type: "expense", color: "#8b5cf6", icon: "film" },
  { name: "Healthcare",   type: "expense", color: "#ec4899", icon: "heart" },
  { name: "Shopping",     type: "expense", color: "#6366f1", icon: "shopping-bag" },
  { name: "Education",    type: "expense", color: "#14b8a6", icon: "book" },
  { name: "Other",        type: "expense", color: "#94a3b8", icon: "tag" },
];

// @route   POST /api/categories/seed
// @access  Private
// Seeds default categories for a new user (call once after register)
const seedCategories = async (req, res) => {
  try {
    const existing = await Category.find({ user: req.user._id });
    if (existing.length > 0) {
      return res.status(400).json({ message: "Categories already seeded" });
    }

    const cats = defaultCategories.map((c) => ({ ...c, user: req.user._id }));
    const created = await Category.insertMany(cats);

    res.status(201).json({
      message: `${created.length} default categories created`,
      categories: created,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const { type } = req.query; // optional filter: ?type=income or ?type=expense
    const filter = { user: req.user._id };
    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ type: 1, name: 1 });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;

    const exists = await Category.findOne({ user: req.user._id, name, type });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      user: req.user._id,
      name,
      type,
      color: color || "#6366f1",
      icon: icon || "tag",
    });

    res.status(201).json({ message: "Category created", category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name, color, icon } = req.body;
    if (name) category.name = name;
    if (color) category.color = color;
    if (icon) category.icon = icon;

    const updated = await category.save();
    res.json({ message: "Category updated", category: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  seedCategories,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:5173", // React Vite frontend
  credentials: true,
}));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────
app.use("/api/auth",         require("./routers/authRoutes"));
app.use("/api/categories",   require("./routers/categoryRoutes"));
app.use("/api/transactions", require("./routers/transactionRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Finance Tracker API is running ✅" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
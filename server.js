// ─────────────────────────────────────────────────────────────
// server.js — Application entry point
// ─────────────────────────────────────────────────────────────

// Load environment variables from .env FIRST before anything else
require("dotenv").config();

const path = require("path");

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
// const PORT = process.env.PORT || 3000;

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

app.use(
  cors({
    origin: process.env.API_BASE_URL,
    credentials: true,
  }),
);

// ── Global Middleware ─────────────────────────────────────────
app.use(express.json()); // parse application/json bodies
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public")));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/", authRoutes); // POST /api/admin/register, /api/admin/login
app.use("/api/products", productRoutes); // CRUD + toggle
app.use("/api", orderRoutes); // POST /api/generate-whatsapp-link

// ── Admin page route (form page) ─────────────────────────────
app.get(
  "/admin",
  //no sendFile
);

// ── Health check ──────────────────────────────────────────────
// app.get("/", (req, res) => {
//   res.json({ status: "ok", message: "WhatsApp Ordering API is running." });
// });
app.get(
  "*",
  // no sendFile
);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global error handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal server error." });
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀  Server running at http://localhost:${PORT}`);
});

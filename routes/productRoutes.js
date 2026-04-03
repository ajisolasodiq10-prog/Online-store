// routes/productRoutes.js
//
// Public:
//   GET  /api/products
//
// Admin (protected):
//   POST   /api/products
//   PUT    /api/products/:id
//   DELETE /api/products/:id
//   PATCH  /api/products/:id/toggle-availability

const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getAvailableProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
} = require("../controllers/productController");

const router = express.Router();

// ── Public ────────────────────────────────────────────────────
router.get("/", getAvailableProducts);
router.get("/:id", getProduct);

// ── Admin ─────────────────────────────────────────────────────
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);
router.patch("/:id/toggle-availability", protect, toggleAvailability);

module.exports = router;

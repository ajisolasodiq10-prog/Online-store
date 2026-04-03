// ─────────────────────────────────────────────────────────────
// models/Product.js
//
// Represents a single orderable product.
//
// Fields:
//   name         — display name shown to customers
//   price        — price in the smallest currency unit (e.g. Naira)
//   image        — URL string or server path to the product image
//   category     — optional grouping tag (e.g. "stationery", "accessories")
//   isAvailable  — controls whether customers can see/order this product
//                  admin can toggle this with PATCH /api/products/:id/toggle-availability
// ─────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters."],
      maxlength: [100, "Name cannot exceed 100 characters."],
    },

    price: {
      type: Number,
      required: [true, "Product price is required."],
      min: [0, "Price cannot be negative."],
    },

    // URL to a hosted image, or a local path like "/uploads/product.jpg"
    image: {
      type: String,
      required: [true, "Product image is required."],
      trim: true,
    },

    // Optional — useful for filtering products by type on the frontend
    category: {
      type: String,
      trim: true,
      default: null,
    },

    // When false, this product is hidden from public GET /api/products.
    // Admins can still see and manage it.
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);

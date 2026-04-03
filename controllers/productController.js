// ─────────────────────────────────────────────────────────────
// controllers/productController.js
//
// Public:
//   getAvailableProducts  — GET /api/products
//
// Admin (protected):
//   createProduct         — POST /api/products
//   updateProduct         — PUT  /api/products/:id
//   deleteProduct         — DELETE /api/products/:id
//   toggleAvailability    — PATCH /api/products/:id/toggle-availability
// ─────────────────────────────────────────────────────────────

const Product = require("../models/Product");

// ── Public ────────────────────────────────────────────────────

/**
 * GET /api/products
 * Returns only products where isAvailable = true.
 * Sorted newest first.
 */
const getAvailableProducts = async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ count: products.length, products });
  } catch (error) {
    console.error("getAvailableProducts error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error. Could not fetch products." });
  }
};

// ── Admin ─────────────────────────────────────────────────────

/**
 * GET /api/products/:id
 * Returns a single product by ID for admin editing.
 */
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("getProduct error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error. Could not fetch product." });
  }
};

/**
 * POST /api/products
 * Creates a new product.
 * Body: { name, price, image, category? }
 */
/**
 * POST /api/products
 * Creates a new product.
 * Body: { name, price, image, category? }
 */
const createProduct = async (req, res) => {
  const { name, price, image, category } = req.body;

  if (!name || price === undefined || !image) {
    return res
      .status(400)
      .json({ message: "name, price, and image are required." });
  }

  if (isNaN(price) || Number(price) < 0) {
    return res
      .status(400)
      .json({ message: "price must be a non-negative number." });
  }

  try {
    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      image: image.trim(),
      category: category ? category.trim() : null,
    });

    return res.status(201).json({ message: "Product created.", product });
  } catch (error) {
    console.error("createProduct error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error. Could not create product." });
  }
};

/**
 * PUT /api/products/:id
 * Updates any combination of name, price, image, category, isAvailable.
 */
const updateProduct = async (req, res) => {
  const { name, price, image, category, isAvailable } = req.body;

  // Build the update object with only the fields that were sent
  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (price !== undefined) updates.price = Number(price);
  if (image !== undefined) updates.image = image.trim();
  if (category !== undefined)
    updates.category = category ? category.trim() : null;
  if (isAvailable !== undefined) updates.isAvailable = Boolean(isAvailable);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No fields provided to update." });
  }

  if (
    updates.price !== undefined &&
    (isNaN(updates.price) || updates.price < 0)
  ) {
    return res
      .status(400)
      .json({ message: "price must be a non-negative number." });
  }

  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true },
      // new: true        → return the updated document, not the old one
      // runValidators    → apply schema validation rules to the update
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({ message: "Product updated.", product });
  } catch (error) {
    console.error("updateProduct error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error. Could not update product." });
  }
};

/**
 * DELETE /api/products/:id
 * Permanently removes a product.
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({ message: "Product deleted." });
  } catch (error) {
    console.error("deleteProduct error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error. Could not delete product." });
  }
};

/**
 * PATCH /api/products/:id/toggle-availability
 * Flips isAvailable from true → false or false → true.
 * No request body needed.
 */
const toggleAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    return res.status(200).json({
      message: `Product is now ${product.isAvailable ? "available" : "unavailable"}.`,
      isAvailable: product.isAvailable,
      product,
    });
  } catch (error) {
    console.error("toggleAvailability error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error. Could not toggle availability." });
  }
};

module.exports = {
  getAvailableProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleAvailability,
};

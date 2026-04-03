// ─────────────────────────────────────────────────────────────
// controllers/orderController.js
//
// Handles WhatsApp order URL generation.
// NO data is written to the database here.
//
// POST /api/generate-whatsapp-link
//
// The controller:
//   1. Receives package IDs + quantities and product IDs + quantities
//   2. Fetches the names and prices from MongoDB (needed to build the message)
//   3. Validates the user info
//   4. Passes everything to generateWhatsAppUrl()
//   5. Returns the URL to the client — the client then redirects the user
// ─────────────────────────────────────────────────────────────

const Product  = require("../models/Product");
const Package  = require("../models/Package");
const { generateWhatsAppUrl } = require("../utils/whatsapp");


/**
 * POST /api/generate-whatsapp-link
 *
 * Request body:
 * {
 *   packages: [{ id: "<ObjectId>", quantity: 2 }],   ← optional
 *   products: [{ id: "<ObjectId>", quantity: 1 }],   ← optional
 *   user: { name: "John", department: "Nursing", phone: "0801..." }
 * }
 *
 * Response:
 * {
 *   url:     "https://wa.me/...",
 *   message: "Hello, I want to order: ...",
 *   total:   7000
 * }
 */
const generateWhatsAppLink = async (req, res) => {
  const { packages = [], products = [], user } = req.body;

  // ── Validate user info ────────────────────────────────────
  if (!user || !user.name || user.name.trim() === "") {
    return res.status(400).json({ message: "user.name is required." });
  }

  if (packages.length === 0 && products.length === 0) {
    return res.status(400).json({
      message: "Order must include at least one package or product.",
    });
  }

  // Validate each packages entry has id + quantity
  for (const item of packages) {
    if (!item.id || !item.quantity || item.quantity < 1) {
      return res.status(400).json({
        message: "Each package entry must have a valid id and quantity >= 1.",
      });
    }
  }

  // Validate each products entry has id + quantity
  for (const item of products) {
    if (!item.id || !item.quantity || item.quantity < 1) {
      return res.status(400).json({
        message: "Each product entry must have a valid id and quantity >= 1.",
      });
    }
  }

  try {
    // ── Resolve packages ──────────────────────────────────────
    // Fetch the requested packages from MongoDB and populate their products
    // so we can calculate prices and include names in the message.
    const resolvedPackages = [];

    if (packages.length > 0) {
      const packageIds = packages.map((p) => p.id);
      const dbPackages = await Package
        .find({ _id: { $in: packageIds } })
        .populate("products", "name price"); // only need name + price for the message

      // Map each DB result back to the requested quantity
      for (const item of packages) {
        const dbPkg = dbPackages.find((p) => p._id.toString() === item.id);

        if (!dbPkg) {
          return res.status(404).json({ message: `Package not found: ${item.id}` });
        }

        // Resolve the price for this package
        const price = (dbPkg.price !== null && dbPkg.price !== undefined)
          ? dbPkg.price
          : dbPkg.products.reduce((sum, p) => sum + (p.price || 0), 0);

        resolvedPackages.push({
          name:     dbPkg.name,
          price,
          quantity: item.quantity,
        });
      }
    }

    // ── Resolve individual products ───────────────────────────
    const resolvedProducts = [];

    if (products.length > 0) {
      const productIds = products.map((p) => p.id);
      const dbProducts = await Product.find({
        _id:         { $in: productIds },
        isAvailable: true, // only allow ordering available products
      });

      for (const item of products) {
        const dbProduct = dbProducts.find((p) => p._id.toString() === item.id);

        if (!dbProduct) {
          return res.status(404).json({
            message: `Product not found or unavailable: ${item.id}`,
          });
        }

        resolvedProducts.push({
          name:     dbProduct.name,
          price:    dbProduct.price,
          quantity: item.quantity,
        });
      }
    }

    // ── Generate the WhatsApp URL ─────────────────────────────
    const result = generateWhatsAppUrl({
      packages: resolvedPackages,
      products: resolvedProducts,
      user: {
        name:       user.name.trim(),
        department: user.department ? user.department.trim() : null,
        phone:      user.phone      ? user.phone.trim()      : null,
      },
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("generateWhatsAppLink error:", error.message);
    return res.status(500).json({ message: "Server error. Could not generate link." });
  }
};


module.exports = { generateWhatsAppLink };

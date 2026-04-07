// ─────────────────────────────────────────────────────────────
// utils/whatsapp.js
//
// Generates a WhatsApp click-to-chat URL that pre-fills a
// formatted order message.
//
// HOW IT WORKS:
//   WhatsApp supports a URL scheme:
//     https://wa.me/<phone>?text=<url-encoded-message>
//
//   When a customer opens this URL on a phone with WhatsApp:
//     1. WhatsApp opens with the admin's chat already open
//     2. The order message is pre-filled in the text box
//     3. The customer just taps "Send"
//
//   No order is stored in the database — it goes directly to
//   the admin's WhatsApp inbox.
//
// EXPORTS:
//   generateWhatsAppUrl({ packages, products, user }) → URL string
//
// PARAMETERS:
//   packages — array of { name, price, quantity }
//   products — array of { name, price, quantity }
//   user     — { name, department, phone }
//
// RETURNS:
//   A fully encoded wa.me URL string ready to redirect or return to the client.
// ─────────────────────────────────────────────────────────────

/**
 * Format a number as Naira currency.
 * e.g. 7000 → "₦7,000"
 */
const formatCurrency = (amount) => {
  return "₦" + Number(amount).toLocaleString("en-NG");
};

/**
 * Build the plain-text order message.
 *
 * @param {Object} options
 * @param {Array}  options.packages  - [{ name, price, quantity }]
 * @param {Array}  options.products  - [{ name, price, quantity }]
 * @param {Object} options.user      - { name, department, phone }
 * @param {Number} options.total     - pre-calculated total price
 * @returns {string} multi-line order message
 */
const buildOrderMessage = ({ packages, products, user, total }) => {
  const lines = [];

  // Custom message format as requested by user
  lines.push("Hey, I wanted to get:");
  lines.push("");

  // ── Packages section ──────────────────────────────────────
  if (packages && packages.length > 0) {
    lines.push("📦 *Packages:*");
    packages.forEach(({ name, price, quantity }) => {
      const lineTotal = price * quantity;
      lines.push(`  - ${name} x${quantity}  (${formatCurrency(lineTotal)})`);
    });
    lines.push("");
  }

  // ── Individual products section ───────────────────────────
  if (products && products.length > 0) {
    lines.push("🛒 *Products:*");
    products.forEach(({ name, price, quantity }) => {
      const lineTotal = price * quantity;
      lines.push(`  - ${name} x${quantity}  (${formatCurrency(lineTotal)})`);
    });
    lines.push("");
  }

  // ── Total ─────────────────────────────────────────────────
  lines.push(`💰 *Total: ${formatCurrency(total)}*`);
  lines.push("");

  // ── Customer info ─────────────────────────────────────────
  lines.push("👤 *Customer Details:*");
  lines.push(`  Name:       ${user.name}`);
  if (user.department) lines.push(`  Department: ${user.department}`);
  if (user.phone) lines.push(`  Phone:      ${user.phone}`);
  lines.push("  *Thank you!*");
  lines.push("  Any additional products you want to include can go here.");

  return lines.join("\n");
};

/**
 * Generate the final WhatsApp URL.
 *
 * @param {Object} options
 * @param {Array}  options.packages - [{ name, price, quantity }]
 * @param {Array}  options.products - [{ name, price, quantity }]
 * @param {Object} options.user     - { name, department?, phone? }
 * @returns {{ url: string, message: string, total: number }}
 */
const generateWhatsAppUrl = ({ packages = [], products = [], user }) => {
  // ── Calculate total price ─────────────────────────────────
  const packageTotal = packages.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const productTotal = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = packageTotal + productTotal;

  // ── Build and encode the message ─────────────────────────
  const message = buildOrderMessage({ packages, products, user, total });

  // encodeURIComponent ensures special characters (₦, newlines, etc.)
  // are safely embedded in the URL query string
  const encodedMessage = encodeURIComponent(message);

  // ADMIN_PHONE from .env — international format, no + sign
  // e.g. "2348012345678"
  const phone = process.env.ADMIN_PHONE;
  if (!phone || phone.trim() === "") {
    throw new Error("ADMIN_PHONE must be set in environment variables.");
  }

  const url = `https://wa.me/${phone.trim()}?text=${encodedMessage}`;

  return { url, message, total };
};

module.exports = { generateWhatsAppUrl };

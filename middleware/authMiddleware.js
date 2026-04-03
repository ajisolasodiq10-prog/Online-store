// ─────────────────────────────────────────────────────────────
// middleware/authMiddleware.js
//
// Exports one middleware: protect
//
// protect(req, res, next)
//   Reads the JWT from the Authorization header, verifies it,
//   and attaches the decoded payload to req.admin.
//   Rejects the request with 401 if the token is missing/invalid.
//
// Usage in routes:
//   router.post("/products", protect, createProduct);
// ─────────────────────────────────────────────────────────────

const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  // ── Read the Authorization header ─────────────────────────
  // Expected format: "Bearer <token>"
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // jwt.verify() throws if the token is tampered with or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload to req.admin so controllers can
    // access adminId, username, etc. without another DB call.
    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized. Token is invalid or expired." });
  }
};

module.exports = protect;

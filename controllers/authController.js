// ─────────────────────────────────────────────────────────────
// controllers/authController.js
//
// Handles admin account management.
//
// Exports:
//   registerAdmin  — create a new admin (useful for first-time setup)
//   loginAdmin     — verify credentials, return JWT
// ─────────────────────────────────────────────────────────────

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// ════════════════════════════════════════════════════════════
// registerAdmin
// POST /api/admin/register
//
// Creates a new admin account.
// In production you may want to remove this public route and
// seed the first admin directly in the database.
// ════════════════════════════════════════════════════════════
const registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required." });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });
  }

  try {
    const existing = await Admin.findOne({ username: username.trim() });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An admin with that username already exists." });
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, rounds);

    const admin = await Admin.create({
      username: username.trim(),
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Admin account created.",
      adminId: admin._id,
      username: admin.username,
    });
  } catch (error) {
    console.error("registerAdmin error:", error.message);
    return res
      .status(500)
      .json({ message: "Server error. Could not create admin." });
  }
};

// ════════════════════════════════════════════════════════════
// loginAdmin
// POST /api/admin/login
//
// Verifies credentials and returns a signed JWT on success.
// The JWT contains { adminId, username } in its payload.
// ════════════════════════════════════════════════════════════
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required." });
  }

  try {
    const admin = await Admin.findOne({ username: username.trim() });

    // Intentionally vague — don't reveal which field is wrong
    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const token = jwt.sign(
      { adminId: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    console.error("loginAdmin error:", error.message);
    return res.status(500).json({ message: "Server error. Could not log in." });
  }
};

module.exports = { registerAdmin, loginAdmin };

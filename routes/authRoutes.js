// routes/authRoutes.js
// POST /api/admin/register
// POST /api/admin/login

const express = require("express");
const { registerAdmin, loginAdmin } = require("../controllers/authController");

const router = express.Router();

// Create an admin account (first-time setup; lock this down in production)
router.post("/register", registerAdmin);
// Login — returns JWT on success
router.post("/login", loginAdmin);

module.exports = router;

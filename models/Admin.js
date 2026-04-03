// ─────────────────────────────────────────────────────────────
// models/Admin.js
//
// Represents a single admin account.
// Passwords are stored as bcrypt hashes — never plain text.
//
// Only these fields are stored. Everything order-related goes to
// WhatsApp, not MongoDB.
// ─────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type:      String,
      required:  [true, "Username is required."],
      unique:    true,
      trim:      true,
      minlength: [3, "Username must be at least 3 characters."],
    },

    // Stored as a bcrypt hash — never the raw password.
    // Hashing happens in authController before .save() is called.
    password: {
      type:     String,
      required: [true, "Password is required."],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);

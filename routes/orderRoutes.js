// routes/orderRoutes.js
//
// POST /api/generate-whatsapp-link
// Public — customers call this to get their order URL.
// No JWT needed; no data is stored.

const express = require("express");
const { generateWhatsAppLink } = require("../controllers/orderController");

const router = express.Router();

router.post("/generate-whatsapp-link", generateWhatsAppLink);

module.exports = router;

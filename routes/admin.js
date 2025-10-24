const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

// 🧭 Admin Dashboard – shows all listing owned by the admin
router.get("/dashboard", isLoggedIn, isAdmin, wrapAsync(listingController.adminDashboard));

// 🧩 Optionally, you can add more admin-only features later
// Example: Delete any listing (admin privilege)
router.delete("/listing/:id", isLoggedIn, isAdmin, wrapAsync(listingController.destroyListing));

module.exports = router;

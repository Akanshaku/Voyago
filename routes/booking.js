const express = require("express"); 
const router = express.Router({ mergeParams: true }); 
const { isLoggedIn } = require("../middleware"); 
const wrapAsync = require("../utils/wrapAsync"); 
const bookingController = require("../controllers/bookings"); 
router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking)); 
router.get("/mine", isLoggedIn, wrapAsync(bookingController.myBookings)); 
module.exports = router;
const express = require("express"); 
const router = express.router(); 
const wrapAsync = require("../utils/wrapAsync.js"); 
const { isLoggedIn, isAdmin } = require("../middleware.js"); 
const adminController = require("../controllers/admin.js"); 
// Admin dashboard (manage listing) 
router.get( 
"/dashboard", 
isLoggedIn, 
isAdmin, 
wrapAsync(adminController.dashboard) 
); 
//Show all bookings for listing owned by this admin 
router.get( 
"/bookings", 
isLoggedIn, 
isAdmin, 
wrapAsync(adminController.bookingsIndex) 
); 
//Accept a booking 
router.patch( 
"/bookings/:bookingId/accept", 
isLoggedIn, 
isAdmin, 
wrapAsync(adminController.acceptBooking) 
); 
//Reject a booking 
router.patch( 
"/bookings/:bookingId/reject", 
isLoggedIn, 
isAdmin, 
wrapAsync(adminController.rejectBooking) 
); 
//Cancel a booking 
router.patch( 
"/bookings/:bookingId/cancel", 
isLoggedIn, 
isAdmin, 
wrapAsync(adminController.cancelBooking) 
); 
//full calender 
router.get( 
"/bookings/json", 
isLoggedIn, 
isAdmin, 
wrapAsync(adminController.bookingsJSON) 
); 
router.get("/calendar", isLoggedIn, isAdmin, (req, res) => { 
res.render("admin/calendar");  
}); 
module.exports = router; 

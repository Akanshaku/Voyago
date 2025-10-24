const Booking = require("../models/booking");
const listing = require("../models/listing");
const User = require("../models/user");
const Notification = require("../models/notification");
const { adminSockets } = require("../sockets/sockets");

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.body.booking;

  const listing = await listing.findById(id).populate("owner");
  if (!listing) {
    req.flash("error", "listing not found.");
    return res.redirect("/listing");
  }

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  if (startDateObj >= endDateObj) {
    req.flash("error", "Check-out date must be after check-in date.");
    return res.redirect(`/listing/${id}`);
  }

  // Check for overlapping booked dates
  const isOverlapping = listing.bookedDates?.some(({ startDate, endDate }) => {
    return (
      (startDateObj >= startDate && startDateObj < endDate) ||
      (endDateObj > startDate && endDateObj <= endDate) ||
      (startDateObj <= startDate && endDateObj >= endDate)
    );
  });

  if (isOverlapping) {
    req.flash("error", "Selected dates are already booked. Please choose different dates.");
    return res.redirect(`/listing/${id}`);
  }

  // Create booking
  const booking = new Booking({
    listing: id,
    user: req.user._id,
    startDate: startDateObj,
    endDate: endDateObj,
    status: "pending",
  });

  await booking.save();

  // Update listing booked dates
  listing.bookedDates = listing.bookedDates || [];
  listing.bookedDates.push({ startDate: startDateObj, endDate: endDateObj });
  await listing.save();

  // -----------------------------
  // SOCKET.IO NOTIFICATION
  // -----------------------------
  const adminId = listing.owner._id.toString();
  const io = req.app.get("io");

  if (adminSockets.has(adminId)) {
    for (const socketId of adminSockets.get(adminId)) {
      io.to(socketId).emit("notification", {
        message: `New booking request on "${listing.title}" by ${req.user.username}`,
        type: "success",
        bookingId: booking._id,
      });
    }
  }

  // Save notification in DB for offline admins
  await Notification.create({
    user: listing.owner._id,
    message: `New booking request on "${listing.title}" by ${req.user.username}`,
    type: "booking",
    read: false,
  });

  req.flash("success", "Booking request submitted!");
  res.redirect(`/listing/${id}`);
};

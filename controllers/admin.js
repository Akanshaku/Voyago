const listing = require("../models/listing");
const Booking = require("../models/booking");

module.exports.dashboard = async (req, res) => {
  const listing = await listing.find({ owner: req.user._id });
  res.render("admin/dashboard", { alllisting: listing });
};

module.exports.bookingsIndex = async (req, res) => {
  const { status } = req.query;
  const mylisting = await listing.find({ owner: req.user._id }).select("_id");
  const listingIds = mylisting.map(l => l._id);
  const filter = { listing: { $in: listingIds } };
  if (status) {
    filter.status = status;
  }
  const bookings = await Booking.find(filter)
    .populate("listing")
    .populate("user");

  res.render("admin/bookings", {
    bookings,
    statusFilter: status || ""
  });
};

module.exports.acceptBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "accepted" },
    { new: true }
  ).populate("user").populate("listing");

  if (!booking) {
    req.flash("error", "Booking not found.");
  } else {
    req.flash("success", "Booking accepted successfully.");
  }

  res.redirect("/admin/bookings");
};

module.exports.rejectBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "rejected" },
    { new: true }
  ).populate("user").populate("listing");

  if (!booking) {
    req.flash("error", "Booking not found.");
  } else {
    req.flash("success", "Booking rejected successfully.");
  }

  res.redirect("/admin/bookings");
};

module.exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "cancelled" },
    { new: true }
  ).populate("user").populate("listing");

  if (!booking) {
    req.flash("error", "Booking not found.");
  } else {
    req.flash("success", "Booking cancelled successfully.");
  }

  res.redirect("/admin/bookings");
};

module.exports.bookingsJSON = async (req, res) => {
  try {
    const mylisting = await listing.find({ owner: req.user._id }).select("_id");
    const listingIds = mylisting.map(l => l._id);
    const bookings = await Booking.find({ listing: { $in: listingIds } })
      .populate("listing")
      .populate("user");

    const events = bookings.map(b => ({
      title: `${b?.listing?.title || "Unknown listing"} (${b?.user?.username || "Unknown User"})`,
      start: b?.startDate,
      end: b?.endDate,
      color:
        b.status === "accepted"
          ? "green"
          : b.status === "pending"
          ? "orange"
          : b.status === "rejected"
          ? "red"
          : "gray",
    }));

    res.json(events);
  } catch (err) {
    console.error("Error in bookingsJSON:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

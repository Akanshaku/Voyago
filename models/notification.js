const mongoose = require("mongoose"); 
const Schema = mongoose.Schema; 
 
const notificationSchema = new Schema({ 
  toAdmin: { type: Schema.Types.ObjectId, ref: "User", required: true }, // admin user id 
  type: { type: String, enum: ["newBooking", "cancelBooking", "info"], default: "newBooking" }, 
  message: { type: String, required: true }, 
  payload: { type: Schema.Types.Mixed }, // optional extra data (bookingId, listingId, ...) 
  isRead: { type: Boolean, default: false }, 
  createdAt: { type: Date, default: Date.now } 
}); 
 
module.exports = mongoose.model("Notification", notificationSchema);
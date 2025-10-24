const mongoose = require("mongoose"); 
const Schema = mongoose.Schema; 
const Review = require("./review.js"); 
 
const listingchema = new Schema({  //object 
  title: { 
    type: String, 
    required: true, 
  }, 
  description: String, 
  image: { 
   url: String, 
   filename: String, 
  }, 
  price: Number, 
  location: String, 
  country: String, 
  bookings: [ 
  { 
    type: Schema.Types.ObjectId, 
    ref: "Booking" 
  } 
], 
  reviews: [ 
    { 
      type: Schema.Types.ObjectId, 
      ref: "Review", 
    }, 
  ], 
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
  }, 
  geometry: { 
    type: { 
      type: String, 
      enum: ['Point'], 
      required: false 
    }, 
    coordinates: { 
      type: [Number], 
      required: false 
    }, 
  }, 
  category: { 
    type: String, 
    enum: ["mountains", "arctic", "farms", "deserts"], 
  } 
}); 
 
listingchema.post("findOneAndDelete", async (listing) => { 
  if (listing) { 
    await Review.deleteMany({_id : {$in: listing.reviews}}); 
  } 
}); 
 
const listing = mongoose.model("listing", listingchema); 
module.exports = listing; 
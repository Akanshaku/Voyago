const express = require("express"); 
const router = express.Router({ mergeParams: true });  //new learning 
const wrapAsync = require("../utils/wrapAsync.js"); 
const ExpressError = require("../utils/ExpressError.js"); 
const listing = require("../models/listing.js"); 
const Review = require("../models/review.js"); 
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware.js"); 
const reviewController = require("../controllers/reviews.js");  
const review = require("../models/review.js"); 
//Reviews 
//Post routes 
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview)); 
//Delete review routes 
router.delete ( 
"/:reviewId",  isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview) 
); 
module.exports = router;
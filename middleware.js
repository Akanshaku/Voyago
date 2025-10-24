const listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingchema, reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;    
    req.flash("error", "you must be logged in to create listing");
    return res.redirect("/login");
  }
  next();
}

module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
        req.flash('error', 'You are not authorized to view this page.');
        return res.redirect('/listing');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await listing.findById(id);
  if (!listing.owner.equals(req.user._id)) {
  req.flash("error", "You don't have permission to edit as you are not the owner");
  return res.redirect(`/listing/${id}`);

  } 
  next();
};

module.exports.validatelisting = (req, res, next) => {
    let { error } = listingchema.validate(req.body);
 if(error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
  if(error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
let review = await Review.findById(reviewId);
if (!review.author.equals(req.user._id)) {
  req.flash("error", "You don't have permission to delete this review");
  return res.redirect(`/listing/${id}`);

}
  next();
};
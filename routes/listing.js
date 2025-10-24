const express = require("express"); 
const router = express.Router(); 
const wrapAsync = require("../utils/wrapAsync.js"); 
const listing = require("../models/listing.js"); 
const { isLoggedIn, isOwner, validatelisting } = require("../middleware.js"); 
const listingController = require("../controllers/listing.js"); 
const { isAdmin } = require("../middleware.js"); 
const multer = require('multer') 
const {storage} = require("../cloudConfig.js"); 
const upload = multer({ storage }); 
 
router.route("/") 
.get(wrapAsync(listingController.index)) 
.post(
  isLoggedIn,
  (req, res, next) => upload.single("listing[image]")(req, res, next),
  validatelisting,
  wrapAsync(listingController.createlisting)
);

 
//New routes 
router.get("/new", isLoggedIn, listingController.renderNewForm); 
 
//Edit routes 
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm)); 
 
router.route("/:id") 
  .get(wrapAsync(listingController.showlisting)) 
  .put( 
    isLoggedIn, 
    isOwner, 
    upload.single("listing[image]"),    
    validatelisting, 
    wrapAsync(listingController.updatelisting) 
  ) 
  .delete( 
    isLoggedIn, 
    isOwner, 
    upload.single("listing[image]"), 
    validatelisting, 
    wrapAsync(listingController.destroylisting) 
  ); 
module.exports = router;
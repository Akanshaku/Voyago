const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// ========================== INDEX / listing ==========================
module.exports.index = async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";
    let alllisting;

    if (query.length > 0) {
      alllisting = await Listing.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { location: { $regex: query, $options: "i" } }
        ]
      });
    } else {
      alllisting = await Listing.find({});
    }

    res.render("listing/index", { alllisting, query });
  } catch (err) {
    console.error("Error fetching listing:", err);
    req.flash("error", "Unable to fetch listing at the moment.");
    res.redirect("/");
  }
};

// ========================== ADMIN DASHBOARD ==========================
module.exports.adminDashboard = async (req, res) => {
  try {
    const alllisting = await Listing.find({ owner: req.user._id });
    res.render("admin/dashboard", { alllisting });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    req.flash("error", "Unable to load dashboard.");
    res.redirect("/");
  }
};

// ========================== NEW LISTING FORM ==========================
module.exports.renderNewForm = (req, res) => {
  res.render("listing/new");
};

// ========================== SHOW LISTING ==========================
module.exports.showlisting = async (req, res) => {
  try {
    const { id } = req.params;
    const listingDoc = await Listing.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("owner");

    if (!listingDoc) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listing");
    }

    res.render("listing/show", { listing: listingDoc });
  } catch (err) {
    console.error("Error showing listing:", err);
    req.flash("error", "Unable to show listing.");
    res.redirect("/listing");
  }
};

// ========================== CREATE LISTING ==========================
module.exports.createlisting = async (req, res) => {
  try {
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;

    if (req.file?.path && req.file?.filename) {
      newlisting.image = { url: req.file.path, filename: req.file.filename };
    }


    if (req.body.listing.location?.trim() && mapToken) {
      try {
        const response = await geocodingClient.forwardGeocode({
          query: req.body.listing.location,
          limit: 1
        }).send();

      newlisting.geometry = response.body.features[0]?.geometry || null;
    } catch (geoError) {
        console.error("❌ Geocoding failed:", geoError.message);
        newlisting.geometry = null;
      }
    } else {
      newlisting.geometry = null;  
    }

    await newlisting.save();
    req.flash("success", "New listing created!");
    res.redirect("/listing");
  } catch (err) {
    console.error("Error creating listing:", err);
    req.flash("error", "Unable to create listing.");
    res.redirect("/listing/new");
  }
};

// ========================== EDIT LISTING FORM ==========================
module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const listingDoc = await Listing.findById(id);

    if (!listingDoc) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listing");
    }

    const originalImageUrl = listingDoc.image?.url
      ? listingDoc.image.url.replace("/upload", "/upload/w_250")
      : null;

    res.render("listing/edit", { listing: listingDoc, originalImageUrl });
  } catch (err) {
    console.error("Error rendering edit form:", err);
    req.flash("error", "Unable to edit listing.");
    res.redirect("/listing");
  }
};

// ========================== UPDATE LISTING ==========================
module.exports.updatelisting = async (req, res) => {
  try {
    const { id } = req.params;
    const listingDoc = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

    if (!listingDoc) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listing");
    }

    if (req.file) {
      listingDoc.image = { url: req.file.path, filename: req.file.filename };
    }

    if (req.body.listing.location?.trim() && mapToken) {
      const response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    listingDoc.geometry = response.body.features?.[0]?.geometry || listingDoc.geometry || null;
    } else {
        listingDoc.geometry = listingDoc.geometry || null;
      }


    await listingDoc.save();
    req.flash("success", "Listing updated!");
    res.redirect(`/listing/${id}`);
  } catch (err) {
    console.error("Error updating listing:", err);
    req.flash("error", "Unable to update listing.");
    res.redirect(`/listing/${req.params.id}/edit`);
  }
};

// ========================== DELETE LISTING ==========================
module.exports.destroylisting = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedlisting = await Listing.findByIdAndDelete(id);

    if (!deletedlisting) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listing");
    }

    req.flash("success", "Listing deleted!");
    res.redirect("/listing");
  } catch (err) {
    console.error("Error deleting listing:", err);
    req.flash("error", "Unable to delete listing.");
    res.redirect("/listing");
  }
};


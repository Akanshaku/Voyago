if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
//const io = new Server(server);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080", // or 3000 if using a React frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true
  }
});


// Socket.IO setup
const { setupSocketIO, adminSockets } = require("./sockets/sockets");
setupSocketIO(io);
app.set("io", io);
app.set("adminSockets", adminSockets); 

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// routers
const listingrouter = require("./routes/listing.js");
const reviewrouter = require("./routes/review.js");
const userrouter = require("./routes/user.js");
const adminrouter = require("./routes/admin.js");
const bookingrouter = require("./routes/booking.js");
const socialroutes = require('./routes/social.js');

// Helmet
const helmet = require("helmet");

// MongoDB connection
//const MONGO_URL = "mongodb://127.0.0.1:27017/voyago";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => console.log(" Connected to MongoDB"))
  .catch((err) => console.error(" DB Error:", err));

async function main() {
  await mongoose.connect(dbUrl);
}

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// Helmet CSP config
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://api.mapbox.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "blob:",
      ],
      workerSrc: ["'self'", "blob:"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://api.mapbox.com",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
      ],
      connectSrc: [
        "'self'",
        "https://*.tiles.mapbox.com",
        "https://events.mapbox.com",
        "https://api.mapbox.com",
        "http://localhost:8080",
        "ws://localhost:8080",
        "https://cdn.jsdelivr.net",   // ✅ added for Bootstrap CDN
        "https://cdnjs.cloudflare.com", 
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com",
        "https://images.unsplash.com",
        "https://plus.unsplash.com",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "data:",
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24*3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});
// Session config
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};


app.use(session(sessionOptions));
app.use(flash());

// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Simple Privacy Policy route
app.get("/privacy", (req, res) => {
  res.render("privacy"); // render views/privacy.ejs
});

// Locals
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;
  next();
});

// routers
app.use("/listing", listingrouter);
app.use("/listing/:id/reviews", reviewrouter);
app.use("/listing/:id/bookings", bookingrouter);
app.use("/", userrouter);
app.use("/admin", adminrouter);
app.use("/", socialroutes);

// 👇 Add this route before the 404 handler
app.get("/", (req, res) => {
  res.render("listing/index"); // or create "views/home.ejs" if you want a homepage
});


// 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// Start server (with socket.io)
server.listen(8080, () => {
  console.log(" Server listening on http://localhost:8080");
});
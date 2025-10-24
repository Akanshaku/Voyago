const express = require("express"); 
const router = express.Router(); 
const socialController = require("../controllers/socialController"); 
router.get("/redirect/:platform", socialController.redirectToSocial); 
module.exports = router; 

const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const utilities = require("../utilities");

// Wishlist routes
router.post("/add", 
  utilities.checkLogin,
  utilities.handleErrors(wishlistController.addToWishlist)
);

router.post("/remove", 
  utilities.checkLogin,
  utilities.handleErrors(wishlistController.removeFromWishlist)
);

router.get("/", 
  utilities.checkLogin,
  utilities.handleErrors(wishlistController.viewWishlist)
);

module.exports = router;
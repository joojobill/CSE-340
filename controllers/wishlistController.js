const wishlistModel = require("../models/wishlist-model");
const utilities = require("../utilities");

const wishlistCont = {};

/* ***************************
 * Add to wishlist
 * ************************** */
wishlistCont.addToWishlist = async (req, res, next) => {
  try {
    const { inv_id } = req.body;
    const account_id = res.locals.user.account_id;
    
    await wishlistModel.addToWishlist(account_id, inv_id);
    req.flash("success", "Vehicle added to wishlist");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

/* ***************************
 * Remove from wishlist
 * ************************** */
wishlistCont.removeFromWishlist = async (req, res, next) => {
  try {
    const { inv_id } = req.body;
    const account_id = res.locals.user.account_id;
    
    await wishlistModel.removeFromWishlist(account_id, inv_id);
    req.flash("success", "Vehicle removed from wishlist");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

/* ***************************
 * View wishlist
 * ************************** */
wishlistCont.viewWishlist = async (req, res, next) => {
  try {
    const account_id = res.locals.user.account_id;
    const wishlist = await wishlistModel.getWishlist(account_id);
    const nav = await utilities.getNav();
    
    res.render("account/wishlist", {
      title: "My Wishlist",
      nav,
      wishlist: wishlist.rows,
      messages: req.flash()
    });
  } catch (error) {
    utilities.handleError(error, req, res);
  }
};

module.exports = wishlistCont;
const express = require("express");
const { protect } = require('../middlewares/auth.middleware');
const { cacheRoute, clearCache } = require('../middlewares/cacheMiddleware');
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favorite.controller");

const router = express.Router();

// Cache user favorites for 1 minute (60 seconds) since they can change frequently
router.get('/', protect, cacheRoute(60, 'user:favorites:'), getFavorites);

// Clear favorites cache when adding/removing favorites
router.post('/:id', protect, clearCache('user:favorites:*'), addFavorite);
router.delete('/:id', protect, clearCache('user:favorites:*'), removeFavorite);

module.exports = router;
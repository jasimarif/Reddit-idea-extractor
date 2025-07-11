const express = require("express");
const {
  addFavorite,
  removeFavorite,
  getFavorites,
} = require("../controllers/favorite.controller");
const {protect} = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/:id', protect, addFavorite)
router.delete('/:id', protect, removeFavorite)
router.get('/', protect, getFavorites)

module.exports = router;
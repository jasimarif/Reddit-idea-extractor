const favoriteService = require('../services/favorite.service');

const addFavorite = async (req, res, next) => {
  try {
    const favorite = await favoriteService.addToFavorites(req.user.id, req.params.id);
    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      data: favorite
    });
  } catch (error) {
    res.status(error.message === 'Post not found' ? 404 : 400).json({
      success: false,
      message: error.message
    });
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    await favoriteService.removeFromFavorites(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    res.status(error.message === 'Favorite not found' ? 404 : 400).json({
      success: false,
      message: error.message
    });
  }
};

const getFavorites = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await favoriteService.getUserFavorites(req.user.id, parseInt(page), parseInt(limit));
    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites
};

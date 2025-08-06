const mongoose = require('mongoose');
const Post = require("../models/PainPoint");
const Favorite = require("../models/Favorite");

const getIdeas = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.category) {
      const categories = req.query.category.split(",").map(c => c.trim());
      query.category = categories.length > 1
        ? { $in: categories }
        : categories[0];
    }

    if (req.query.tags) {
      const tags = req.query.tags.split(",");
      query.tags = { $in: tags };
    }

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { idea: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const total = await Post.countDocuments(query);

    const ideas = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate("userId", "name")
      .skip(skip)
      .limit(limit);

    let ideasWithFavorites = ideas;
    if (req.user) {
      const favoriteIds = await Favorite.find({ user: req.user.id }).distinct(
        "post"
      );
      ideasWithFavorites = ideas.map((idea) => ({
        ...idea.toObject(),
        isFavorite: favoriteIds.some(
          (fav) => fav.toString() === idea._id.toString()
        ),
      }));
    }
    res.status(200).json({
      success: true,
      data: ideasWithFavorites,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getIdea = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid idea ID format',
        error: 'INVALID_ID_FORMAT'
      });
    }

    const idea = await Post.findById(id).populate("userId", "name");
    
    if (!idea) {
      return res.status(404).json({ 
        success: false, 
        message: "Idea not found",
        error: 'IDEA_NOT_FOUND'
      });
    }

    let isFavorite = false;
    try {
      if (req.user) {
        const favorite = await Favorite.findOne({
          user: req.user.id,
          post: idea._id,
        });
        isFavorite = !!favorite;
      }
      
      res.status(200).json({
        success: true,
        data: {
          ...idea.toObject(),
          isFavorite,
        },
      });
    } catch (dbError) {
      console.error('Error checking favorite status:', dbError);
      // Still return the idea even if favorite check fails
      res.status(200).json({
        success: true,
        data: {
          ...idea.toObject(),
          isFavorite: false,
        },
      });
    }
  } catch (error) {
    console.error('Error in getIdea:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        error: 'INVALID_ID_FORMAT'
      });
    }
    
    // Pass other errors to the error handler
    next(error);
  }
};


const getTags = async (req, res, next) => {
  try {
    const tags = await Post.distinct("tags");

    res.status(200).json({
      success: true,
      data: tags.filter((tag) => tag && tag.trim() !== "").sort(),
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Post.distinct("category");
    
    const formattedCategories = categories
      .filter(category => category && category.trim() !== "")
      .sort()
      .map(category => ({ name: category }));

    res.status(200).json({
      success: true,
      data: formattedCategories,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getIdeas,
  getIdea,
  getTags,
  getCategories,
};

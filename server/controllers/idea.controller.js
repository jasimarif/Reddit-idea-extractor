const Post = require("../models/Post");
const Favorite = require("../models/Favorite");

const getIdeas = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.category) {
      query.category = req.query.category;
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
    const idea = await Post.findById(req.params.id).populate("userId", "name");
    if (!idea) {
      return res
        .status(404)
        .json({ success: false, message: "Idea not found" });
    }

    let isFavorite = false;
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
  } catch (error) {
    next(error);
  }
};

const createIdea = async (req, res, next) => {
  try {
    const { title,
      body,
      summary,
      tags,
      url,
      topic,
      postDate,
      subreddit, } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and body",
      });
    }

    const newIdea = new Post({
      title,
      body,
      summary: summary || "",
      tags: tags || [],
      url,
      topic,
      postDate,
      subreddit: subreddit || "manual",
      userId: req.user ? req.user._id : null,
      isManuallyAdded: true,
      isProcessed: true,
      status: "processed",
    });

    await newIdea.save(); // Save the new idea to the database


    res.status(201).json({
      success: true,
      data: newIdea,
    });
  } catch (error) {
    next(error);
  }
};

const getTags = async (req, res, next) => {
  try {
    const tags = await Post.distinct('tags');
    
    res.status(200).json({
      success: true,
      data: tags.filter(tag => tag && tag.trim() !== '').sort()
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const Category = require('../models/Category');
    const categories = await Category.find().sort({ name: 1 });
    
    // If no categories exist, return default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Health', description: 'Health and wellness opportunities', color: '#10B981' },
        { name: 'Wealth', description: 'Business and financial opportunities', color: '#3B82F6' },
        { name: 'Relationships', description: 'Social and relationship solutions', color: '#F59E0B' }
      ];
      
      return res.status(200).json({
        success: true,
        data: defaultCategories
      });
    }
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

const fetchIdeasNow = async (req, res, next) => {
  try {
    const subreddit = req.query.subreddit || 'Entrepreneur';
    const limit = parseInt(req.query.limit) || 5;

    const result = await ideaService.fetchAndSaveRedditIdeas(subreddit, limit);

    res.status(200).json({
      success: true,
      message: `Successfully fetched and saved ${result.savedCount} new ideas from r/${subreddit}`,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIdeas,
  getIdea,
  createIdea,
  getTags,
  getCategories,
  fetchIdeasNow
};

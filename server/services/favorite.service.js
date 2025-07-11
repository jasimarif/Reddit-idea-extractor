const Favorite = require('../models/Favorite')
const Post = require('../models/Post');

async function addToFavorites(userId, postId) {
  const post = await Post.findById(postId);
  if (!post) throw new Error('Post not found');

  const existing = await Favorite.findOne({ user: userId, post: postId });
  if (existing) throw new Error('Post already in favorites');

  return Favorite.create({ user: userId, post: postId });
}

async function removeFromFavorites(userId, postId) {
  const favorite = await Favorite.findOneAndDelete({ user: userId, post: postId });
  if (!favorite) throw new Error('Favorite not found');
  return favorite;
}

async function getUserFavorites(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const total = await Favorite.countDocuments({ user: userId });
  const favorites = await Favorite.find({ user: userId })
    .populate('post')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const posts = favorites.map(f => f.post);

  return {
    posts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
}

module.exports = {
  addToFavorites,
  removeFromFavorites,
  getUserFavorites
};
const { get, set } = require('../utils/redisClient');

/**
 * Middleware to cache route responses
 * @param {number} ttlSeconds - Time to live in seconds (default: 300)
 * @param {string} prefix - Optional prefix for cache key (e.g., 'ideas:')
 * @returns {Function} Express middleware function
 */
const cacheRoute = (ttlSeconds = 300, prefix = '') => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache for authenticated routes that require user-specific data
    if (req.headers.authorization || req.cookies?.token) {
      return next();
    }

    const cacheKey = `${prefix}${req.originalUrl || req.url}`;
    
    try {
      // Try to get cached data
      const cachedData = await get(cacheKey);
      
      if (cachedData !== null) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(cachedData);
      }
      
      console.log(`Cache miss for ${cacheKey}`);
      
      // Override res.json to cache the response before sending
      const originalJson = res.json;
      res.json = (body) => {
        // Don't cache error responses
        if (res.statusCode >= 400) {
          return originalJson.call(res, body);
        }
        
        // Cache the successful response
        set(cacheKey, body, ttlSeconds)
          .then(success => {
            if (success) {
              console.log(`Cached response for ${cacheKey} for ${ttlSeconds} seconds`);
            }
          })
          .catch(err => {
            console.error(`Failed to cache response for ${cacheKey}:`, err);
          });
          
        return originalJson.call(res, body);
      };
      
      next();
    } catch (error) {
      console.error(`Cache middleware error for ${cacheKey}:`, error);
      next();
    }
  };
};

/**
 * Middleware to clear cache for specific routes
 * @param {string} pattern - The pattern to match cache keys
 * @returns {Function} Express middleware function
 */
const clearCache = (pattern) => {
  return async (req, res, next) => {
    try {
      // Clear cache after the response is sent
      res.on('finish', async () => {
        if (res.statusCode < 400) {
          const { clearByPattern } = require('../utils/redisClient');
          await clearByPattern(pattern);
          console.log(`Cleared cache for pattern: ${pattern}`);
        }
      });
      next();
    } catch (error) {
      console.error(`Clear cache error for pattern ${pattern}:`, error);
      next();
    }
  };
};

module.exports = {
  cacheRoute,
  clearCache
};

const { createClient } = require('redis');

let client;
let isConnected = false;

/**
 * Initialize Redis client with connection and error handling
 */
const initializeRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.error('Max Redis reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          // Reconnect after 1 second
          return 1000;
        }
      }
    });

    client.on('error', (err) => {
      console.error(`Redis Client Error: ${err}`);
      isConnected = false;
    });

    client.on('connect', () => {
      console.info('Redis client connected');
      isConnected = true;
    });

    client.on('reconnecting', () => {
      console.info('Redis client reconnecting...');
      isConnected = false;
    });

    await client.connect();
  } catch (error) {
    console.error(`Failed to connect to Redis: ${error.message}`);
    isConnected = false;
  }
};

/**
 * Get value from Redis by key
 * @param {string} key - The key to get
 * @returns {Promise<object|string|null>} - The value or null if not found or error
 */
const get = async (key) => {
  if (!isConnected) return null;
  
  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Redis get error: ${error.message}`);
    return null;
  }
};

/**
 * Set value in Redis with TTL
 * @param {string} key - The key to set
 * @param {any} value - The value to store (will be stringified)
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const set = async (key, value, ttl) => {
  if (!isConnected) return false;
  
  try {
    const stringValue = JSON.stringify(value);
    if (ttl) {
      await client.set(key, stringValue, { EX: ttl });
    } else {
      await client.set(key, stringValue);
    }
    return true;
  } catch (error) {
    console.error(`Redis set error: ${error.message}`);
    return false;
  }
};

/**
 * Delete a key from Redis
 * @param {string} key - The key to delete
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const del = async (key) => {
  if (!isConnected) return false;
  
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error(`Redis delete error: ${error.message}`);
    return false;
  }
};

/**
 * Clear all keys matching a pattern (use with caution!)
 * @param {string} pattern - The pattern to match keys against
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const clearByPattern = async (pattern) => {
  if (!isConnected) return false;
  
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error(`Redis clear by pattern error: ${error.message}`);
    return false;
  }
};

module.exports = {
  initializeRedis,
  get,
  set,
  del,
  clearByPattern,
  isConnected: () => isConnected
};

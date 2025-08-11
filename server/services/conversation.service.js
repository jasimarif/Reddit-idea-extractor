const { BufferMemory } = require('langchain/memory');

// In-memory store for conversations (in production, replace with Redis or database)
const conversationStore = new Map();

/**
 * Get or create a conversation
 * @param {string} conversationId - Unique ID for the conversation
 * @param {Object} options - Options for the conversation
 * @param {string} options.systemPrompt - System prompt to use for new conversations
 * @returns {Object} Conversation object with memory and metadata
 */
function getOrCreateConversation(conversationId, { systemPrompt = '' } = {}) {
  if (!conversationStore.has(conversationId)) {
    // Create new conversation with BufferMemory
    const memory = new BufferMemory({
      returnMessages: true,
      memoryKey: 'chat_history',
      inputKey: 'input',
      outputKey: 'output',
    });

    conversationStore.set(conversationId, {
      id: conversationId,
      memory,
      systemPrompt,
      createdAt: new Date(),
      lastAccessed: new Date(),
    });
  }

  // Update last accessed time
  const conversation = conversationStore.get(conversationId);
  conversation.lastAccessed = new Date();

  return conversation;
}

/**
 * Clean up old conversations
 * @param {number} maxAgeHours - Maximum age in hours before a conversation is considered stale
 */
function cleanupOldConversations(maxAgeHours = 24) {
  const now = new Date();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

  for (const [id, conversation] of conversationStore.entries()) {
    if (now - conversation.lastAccessed > maxAgeMs) {
      conversationStore.delete(id);
    }
  }
}

// Clean up old conversations every hour
setInterval(() => cleanupOldConversations(), 60 * 60 * 1000);

module.exports = {
  getOrCreateConversation,
  cleanupOldConversations,
};

// LangChain integration for Anthropic (PainPoint) and OpenAI (MarketGap)
const { ChatOpenAI } = require('@langchain/openai');
const { ChatAnthropic } = require('@langchain/anthropic');
const { ConversationChain } = require('langchain/chains');
const { BufferMemory } = require('langchain/memory');

// --- Anthropic PainPoint Agent ---
function getPainPointAgent() {
  const openai = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo', // or your preferred model
    temperature: 0.3,
    maxTokens: 4000,
  });

  const memory = new BufferMemory();
  // You can add tools or custom prompt templates here for advanced features
  return new ConversationChain({ llm: openai, memory });
}

// --- OpenAI MarketGap Agent ---
function getMarketGapAgent() {
  const openai = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-3.5-turbo', // or your preferred model
    temperature: 0.7,
    maxTokens: 4000,
  });
  const memory = new BufferMemory();
  // You can add tools or custom prompt templates here for advanced features
  return new ConversationChain({ llm: openai, memory });
}

module.exports = {
  getPainPointAgent,
  getMarketGapAgent,
}; 
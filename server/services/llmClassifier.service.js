const { OpenAI } = require("openai");


class LLMClassifier {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      
    });
    this.model = "gpt-4";
    this.maxTokens = 2000;
    
    // Define classification tools
    this.tools = [
      {
        name: "analyze_pain_point",
        description: "Analyze if the post describes a business-worthy pain point",
        parameters: {
          type: "object",
          properties: {
            isPainPoint: {
              type: "boolean",
              description: "Whether the post describes a business-worthy pain point"
            },
            reason: {
              type: "string",
              description: "Detailed explanation of the classification decision"
            },
            confidence: {
              type: "number",
              description: "Confidence score from 0 to 1"
            },
            categories: {
              type: "array",
              items: {
                type: "string"
              },
              description: "Relevant business categories for this pain point"
            }
          },
          required: ["isPainPoint", "reason", "confidence"]
        }
      }
    ];
  }

  /**
   * Classify if a Reddit post contains a business-worthy pain point
   * @param {string} title - Post title
   * @param {string} content - Post content
   * @returns {Promise<{isPainPoint: boolean, reason: string}>} Classification result
   */
  async classifyRedditPost(title, content) {
    try {
      if (!process.env.opportunityScreenerAssistantId) {
        throw new Error("opportunityScreenerAssistantId environment variable is required");
      }
      
      // Create a thread for this classification
      const thread = await this.openai.beta.threads.create();
      
      // Add the user message to the thread with clear JSON response instructions
      await this.openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Analyze this Reddit post and respond with a JSON object containing the following fields:
        - isPainPoint (boolean): Whether this post describes a business-worthy pain point
        - reason (string): Detailed explanation of your classification decision
        - confidence (number): Your confidence in this classification (0-1)
        - categories (array): Relevant business categories this pain point falls into
        
        Respond ONLY with a valid JSON object, no other text. Example response:
        {
          "isPainPoint": true,
          "reason": "The post describes a recurring issue with...",
          "confidence": 0.9,
          "categories": ["SaaS", "Productivity"]
        }
        
        Post to analyze:
        Title: ${title}
        Content: ${content}`
      });
      
      // Run the assistant
      const run = await this.openai.beta.threads.runs.create(thread.id, {
        assistant_id: process.env.opportunityScreenerAssistantId,
      });
      
      // Wait for the assistant to complete with proper parameter format
      let runStatus = await this.openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
      while (runStatus.status !== 'completed') {
        if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
          throw new Error(`Run ended with status: ${runStatus.status}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await this.openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id });
      }
      
      // Get the assistant's response
      const messages = await this.openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find(m => m.role === 'assistant');
      
      if (!assistantMessage) {
        throw new Error("No response from assistant");
      }
      
      // Extract the response content
      const responseContent = assistantMessage.content[0].text.value;
      
      // Debug: Log the raw response
      console.log('Raw assistant response:', responseContent);
      
      // Try to parse the response as JSON
      let args = {};
      try {
        // First, try to extract JSON from markdown code blocks
        const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : responseContent;
        
        // Try to parse as JSON
        args = JSON.parse(jsonString);
      } catch (error) {
        console.warn('Failed to parse response as JSON, trying to extract structured data:', error.message);
        
        // If JSON parsing fails, try to extract structured data from text
        const isPainPoint = /(isPainPoint|is_pain_point|pain point):?\s*(true|false|yes|no)/i.exec(responseContent);
        const reasonMatch = /(reason|explanation):?\s*([^\n]+)/i.exec(responseContent);
        
        args = {
          isPainPoint: isPainPoint ? 
            ['true', 'yes'].includes(isPainPoint[2].toLowerCase()) : 
            /(yes|true|pain point found)/i.test(responseContent),
          reason: reasonMatch ? 
            reasonMatch[0] : 
            'No specific reason provided in response',
          confidence: 0.7, // Default confidence for text responses
          _parsedFromText: true
        };
        
        console.log('Extracted structured data from text:', args);
      }
      
      // Validate the response
      if (!args || typeof args.isPainPoint === 'undefined' || !args.reason) {
        throw new Error("Invalid response format from assistant");
      }

      return {
        isPainPoint: Boolean(args.isPainPoint),
        reason: args.reason,
        confidence: Math.min(1, Math.max(0, Number(args.confidence) || 0.5)),
        categories: Array.isArray(args.categories) ? args.categories : [],
        metadata: {
          model: this.model,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error("Error in LLM classification:", error);
      return {
        isPainPoint: false,
        reason: `Error during classification: ${error.message || 'Unknown error'}`,
        error: true,
        confidence: 0,
        metadata: {
          error: error.toString(),
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

module.exports = new LLMClassifier();
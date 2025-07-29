const { OpenAI } = require("openai");

class PageCraftService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.model = "gpt-4";
    this.maxTokens = 8000; // Increased for larger code generation

    // Define tools for the assistant
    this.tools = [];
  }

  async generateLandingPage(landingPageSpecs) {
    try {
      const {
        headline,
        subheadline,
        bulletPoints = [],
        painPointsSection = [],
        outcomeSection = [],
        founderMessage,
        ctaText,
      } = landingPageSpecs;

      if (!process.env.pageCraftAssistantId) {
        throw new Error(
          "pageCraftAssistantId environment variable is required"
        );
      }

      // Create a thread for this classification
      const thread = await this.openai.beta.threads.create();

      // Add the user message to the thread with clear JSON response instructions
      await this.openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: JSON.stringify({
          type: "generate_landing_page",
          data: {
            headline,
            subheadline,
            bulletPoints,
            painPointsSection,
            outcomeSection,
            founderMessage,
            ctaText,
          },
        }),
        
      });

      // Run the assistant on the thread
      const run = await this.openai.beta.threads.runs.create(thread.id, {
        assistant_id: process.env.pageCraftAssistantId,
      });

      // Wait for the assistant to complete with proper parameter format
      let runStatus = await this.openai.beta.threads.runs.retrieve(run.id, {
        thread_id: thread.id,
      });
      while (runStatus.status !== "completed") {
        if (["failed", "cancelled", "expired"].includes(runStatus.status)) {
          throw new Error(`Run ended with status: ${runStatus.status}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await this.openai.beta.threads.runs.retrieve(run.id, {
          thread_id: thread.id,
        });
      }

      // Get the assistant's response
      const messages = await this.openai.beta.threads.messages.list(thread.id);
      const assistantMessages = messages.data.filter(
        (msg) => msg.role === "assistant"
      );

      if (assistantMessages.length === 0) {
        throw new Error("No response from assistant");
      }

      // Get the latest assistant message
      const latestMessage = assistantMessages[0];

      // Check if the message has content and is in the expected format
      if (!latestMessage.content || latestMessage.content.length === 0) {
        throw new Error("Empty response from assistant");
      }

      // Extract the text content from the message
      const messageContent = latestMessage.content[0];
      let responseText = "";

      if (messageContent.type === "text") {
        responseText = messageContent.text.value;
      } else if (
        messageContent.type === "function_call" &&
        messageContent.function_call
      ) {
        // Handle function call response
        if (messageContent.function_call.arguments) {
          try {
            // If it's a JSON string, parse it
            return JSON.parse(messageContent.function_call.arguments);
          } catch (e) {
            // If not JSON, use as plain text
            responseText = messageContent.function_call.arguments;
          }
        }
      }

      // Check if the response looks like JSX/React code
      if (responseText.trim().startsWith('jsx') || responseText.trim().startsWith('import') || responseText.includes('export default') || responseText.includes('</') || responseText.includes('/>')) {
        console.log("Detected JSX/React code in response, cleaning and ensuring valid component format");
        
        // Clean up the response text
        let cleanedCode = responseText;
        
        // Remove markdown code block markers if present
        if (cleanedCode.includes('```jsx') || cleanedCode.includes('```js') || cleanedCode.includes('```')) {
          cleanedCode = cleanedCode
            .replace(/^```(jsx|js)?\n/, '')  // Remove opening code block
            .replace(/\n```[\s\S]*$/, '') // Remove closing code block and anything after it
            .trim();
        }
        
        // Handle arrow function components
        if (cleanedCode.includes('const ') && cleanedCode.includes('= (') && cleanedCode.includes(') =>')) {
          const componentName = cleanedCode.match(/const\s+(\w+)\s*=/)?.[1] || 'LandingPage';
          const componentBody = cleanedCode.split('=>').slice(1).join('=>').trim();
          cleanedCode = `import React from 'react';

function ${componentName}() ${componentBody}

export default ${componentName};`;
        } 
        // Handle regular function components
        else if (cleanedCode.includes('function ')) {
          if (!cleanedCode.includes('import React')) {
            cleanedCode = `import React from 'react';\n\n${cleanedCode}`;
          }
          if (!cleanedCode.includes('export default')) {
            const componentName = cleanedCode.match(/function\s+(\w+)\s*\(/)?.[1] || 'LandingPage';
            cleanedCode = `${cleanedCode}\n\nexport default ${componentName};`;
          }
        }
        // If no component structure found, wrap in a default component
        else {
          cleanedCode = `import React from 'react';

function LandingPage() {
  return (
    <>
      ${cleanedCode}\n    </>
  );
}

export default LandingPage;`;
        }
        
        // Ensure the code ends with a semicolon
        if (!cleanedCode.trim().endsWith(';')) {
          cleanedCode = cleanedCode.trim() + ';';
        }
        
        // Create a clean response object
        const responseObj = {
          reactCode: cleanedCode,
          components: [],
          dependencies: {
            npm: ["react", "react-dom", "next", "tailwindcss"],
            cdn: []
          },
          metaTags: {
            title: landingPageSpecs.headline || "Generated Landing Page",
            description: landingPageSpecs.subheadline || "A beautiful landing page generated with PageCraft"
          }
        };
        
        // Return the object directly without stringifying it
        return responseObj;
      }

      // Try to parse as JSON first
      try {
        return JSON.parse(responseText);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from code blocks
        const jsonMatch = responseText.match(/```(?:json\n)?([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            return JSON.parse(jsonMatch[1].trim());
          } catch (parseError) {
            console.error("Failed to parse extracted JSON:", parseError);
            // Fall through to raw text handling
          }
        }
        
        // If we have text content but couldn't parse it as JSON, wrap it in a response format
        if (responseText.trim()) {
          return {
            reactCode: responseText,
            components: [],
            dependencies: {
              npm: ["react", "react-dom", "next", "tailwindcss"],
              cdn: []
            },
            metaTags: {
              title: landingPageSpecs.headline || "Generated Landing Page",
              description: landingPageSpecs.subheadline || "A beautiful landing page generated with PageCraft"
            }
          };
        }
        
        throw new Error("Empty or invalid response from assistant");
      }
    } catch (error) {
      console.error("Error in PageCraftService.generateLandingPage:", error);
      throw new Error(`Failed to generate landing page: ${error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new PageCraftService();

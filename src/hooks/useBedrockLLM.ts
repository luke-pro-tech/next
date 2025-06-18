'use client';

import { useState, useCallback } from 'react';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { getTools, getFakeWeatherData } from '../app/tools';

export const useBedrockLLM = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  // Fallback manual text enhancement
  const enhanceTextManually = useCallback((text: string): string => {
    // Simple rule-based enhancement for travel context
    if (text.toLowerCase().includes('where') || text.toLowerCase().includes('what')) {
      return `I'm looking for travel recommendations about: ${text}`;
    }
    if (text.toLowerCase().includes('hotel') || text.toLowerCase().includes('stay')) {
      return `I need help finding accommodation: ${text}`;
    }
    if (text.toLowerCase().includes('flight') || text.toLowerCase().includes('travel')) {
      return `I need travel assistance with: ${text}`;
    }
    return `I'd like to know more about: ${text}`;
  }, []);

  const processWithLLM = useCallback(async (inputText: string): Promise<string> => {
    if (!inputText.trim()) {
      return inputText;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const region = process.env.NEXT_PUBLIC_AWS_REGION || "us-west-2";
      const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID || '';
      const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY || '';


      if (!accessKeyId || !secretAccessKey) {
        throw new Error('AWS credentials not configured. Please set NEXT_PUBLIC_AWS_ACCESS_KEY_ID and NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY in your .env.local file');
      }

      const bedrockClient = new BedrockRuntimeClient({
        region,
        credentials: { 
          accessKeyId, 
          secretAccessKey 
        }
      });

      // Build messages array with chat history
      const messages = [
        { 
          role: "assistant" as const, 
          content: [{ 
            text: `You are a helpful travel assistant AI. Try to provide useful information based on user queries. if the user asks about weather, use the getWeather tool."`
          }] 
        },
        // Add chat history
        ...chatHistory.map(msg => ({
          role: msg.role,
          content: [{ text: msg.content }]
        })),
        // Add current user message
        { 
          role: "user" as const, 
          content: [{ 
            text: inputText
          }] 
        }
      ];

      console.log("messages", messages);

      const command = new ConverseCommand({
        modelId: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
        messages,
        toolConfig: {
          tools: getTools().map(tool => ({
            toolSpec: {
              name: tool.name,
              description: tool.description,
              inputSchema: {
                json: tool.parameters
              }
            }
          }))
        },
        inferenceConfig: {
            maxTokens: 300,
            temperature: 0.7
        }
      });


      const response = await bedrockClient.send(command);
      
      // Extract the generated text from Converse response
      const outputMessage = response.output?.message;
      let processedText = inputText;
      
      if (outputMessage?.content) {
        // Check for tool use first
        const toolUseContent = outputMessage.content.find(content => content.toolUse);
        if (toolUseContent?.toolUse) {
          // Handle tool call result - the tool was called by the model
          console.log('Tool called:', toolUseContent.toolUse.name);
          console.log('Tool input:', toolUseContent.toolUse.input);
          
          const toolName = toolUseContent.toolUse.name;
          const toolInput = toolUseContent.toolUse.input as any;
          
          if (toolName === 'getWeather' && toolInput?.city) {
            // Generate fake weather data
            const weatherData = getFakeWeatherData(toolInput.city, toolInput.country);
            processedText = weatherData;
          } else {
            // Fallback: manually enhance the text since tool didn't provide expected output
            processedText = enhanceTextManually(inputText);
          }
        } else {
          // No tool use - check for direct text response
          const textContent = outputMessage.content.find(content => content.text);
          if (textContent?.text) {
            processedText = textContent.text;
          } else {
            // Fallback to manual enhancement
            processedText = enhanceTextManually(inputText);
          }
        }
      } else {
        // No output message - fallback to manual enhancement
        processedText = enhanceTextManually(inputText);
      }
      
      console.log('Original text:', inputText);
      console.log('Bedrock processed text:', processedText);
      
      // Update chat history with user message and assistant response
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: inputText },
        { role: 'assistant', content: processedText }
      ]);
      
      return processedText.trim();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process text with Bedrock';
      console.error('Bedrock invoke error:', err);
      setError(errorMessage);
      
      // Return original text if LLM processing fails
      return inputText;
    } finally {
      setIsProcessing(false);
    }
  }, [enhanceTextManually, chatHistory]);

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  return {
    processWithLLM,
    isProcessing,
    error,
    chatHistory,
    clearChatHistory
  };
};

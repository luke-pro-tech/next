'use client';

import { useState, useCallback } from 'react';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export const useBedrockLLM = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const command = new InvokeModelCommand({
        modelId: 'amazon.titan-text-express-v1',
        body: JSON.stringify({
          inputText: inputText,
          textGenerationConfig: { 
            maxTokenCount: 512, 
            temperature: 0.7, 
            topP: 0.9 
          }
        }),
        contentType: 'application/json',
        accept: 'application/json'
      });

      const response = await bedrockClient.send(command);
      
      // Parse the response body
      const bodyString = await new Response(response.body).text();
      const responseData = JSON.parse(bodyString);
      
      // Extract the generated text from Titan response
      const processedText = responseData.results?.[0]?.outputText || inputText;
      
      console.log('Bedrock processed text:', processedText);
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
  }, []);

  return {
    processWithLLM,
    isProcessing,
    error
  };
};

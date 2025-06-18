import { useState, useCallback, useEffect } from 'react';
import { RTCClient } from '../agoraHelper';
import { sendMessageToAvatar, sendMessageToAvatarWithLLM } from '../agoraHelper';
import { useBedrockLLM } from './useBedrockLLM';

export interface Message {
  id: string;
  text: string;
  isSentByMe: boolean;
}

interface UseMessageStateProps {
  client: RTCClient;
  connected: boolean;
  onStreamMessage?: (uid: number, body: Uint8Array) => void;
  enableLLM?: boolean; // New option to enable/disable LLM processing
}

interface UseMessageStateReturn {
  messages: Message[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  sendMessage: () => Promise<void>;
  clearMessages: () => void;
  addReceivedMessage: (messageId: string, text: string) => void;
  isProcessingLLM: boolean; // New state for LLM processing
  llmError: string | null; // New state for LLM errors
}

export const useMessageState = ({
  client,
  connected,
  onStreamMessage,
  enableLLM = true, // Default to true for LLM processing
}: UseMessageStateProps): UseMessageStateReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  // Initialize Bedrock LLM hook
  const { processWithLLM, isProcessing, error } = useBedrockLLM();

  // Set up stream message listener
  useEffect(() => {
    if (connected && onStreamMessage) {
      client.on('stream-message', onStreamMessage);
      return () => {
        client.removeAllListeners('stream-message');
      };
    }
  }, [client, connected, onStreamMessage]);

  const sendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !connected || sending || isProcessing) return;

    setSending(true);
    const messageId = Date.now().toString();

    // Add message to local state immediately
    const newMessage: Message = {
      id: messageId,
      text: inputMessage,
      isSentByMe: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');

    try {
      if (enableLLM) {
        // Use LLM processing before sending to avatar
        await sendMessageToAvatarWithLLM(client, messageId, currentMessage, processWithLLM);
      } else {
        // Send directly to avatar without LLM processing
        await sendMessageToAvatar(client, messageId, currentMessage);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Optionally remove the message from state if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } finally {
      setSending(false);
    }
  }, [client, connected, inputMessage, sending, isProcessing, enableLLM, processWithLLM]);

  const addReceivedMessage = useCallback((messageId: string, text: string) => {
    setMessages((prev) => {
      // Check if message already exists
      const existingMessageIndex = prev.findIndex((msg) => msg.id === messageId);
      if (existingMessageIndex !== -1) {
        // Update existing message
        const newMessages = [...prev];
        newMessages[existingMessageIndex] = {
          ...newMessages[existingMessageIndex],
          text: newMessages[existingMessageIndex].text + text,
        };
        return newMessages;
      }
      // Add new message
      return [...prev, { id: messageId, text, isSentByMe: false }];
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setInputMessage('');
  }, []);

  return {
    messages,
    inputMessage,
    setInputMessage,
    sendMessage,
    clearMessages,
    addReceivedMessage,
    isProcessingLLM: isProcessing,
    llmError: error,
  };
};

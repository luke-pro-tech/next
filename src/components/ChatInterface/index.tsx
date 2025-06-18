import { useRef, useEffect, useCallback } from 'react';
import { RTCClient, interruptResponse } from '../../agoraHelper';
import { useMessageState } from '../../hooks/useMessageState';
import './styles.css';

interface ChatInterfaceProps {
  client: RTCClient;
  connected: boolean;
  micEnabled: boolean;
  setMicEnabled: (enabled: boolean) => void;
  toggleMic?: () => Promise<void>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ client, connected, micEnabled, setMicEnabled, toggleMic }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleStreamMessage = useCallback((_: number, body: Uint8Array) => {
    const msg = new TextDecoder().decode(body);
    const { v, type, mid, pld } = JSON.parse(msg);
    if (v !== 2) {
      console.log(`unsupported message version, v=${v}`);
      return;
    }
    if (type === 'chat') {
      const { text } = pld;
      addReceivedMessage(`${type}_${mid}`, text);
    }
  }, []);

  const { 
    messages, 
    inputMessage, 
    setInputMessage, 
    sendMessage, 
    addReceivedMessage, 
    clearMessages,
    isProcessingLLM,
    llmError 
  } = useMessageState({
    client,
    connected,
    onStreamMessage: handleStreamMessage,
    enableLLM: true, // Enable LLM processing
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add effect to clear messages when connection is lost
  useEffect(() => {
    if (!connected) {
      clearMessages();
    }
  }, [connected, clearMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMicInternal = async () => {
    if (toggleMic) {
      await toggleMic();
      return;
    }

    // Fallback implementation if toggleMic is not provided
    if (!micEnabled) {
      setMicEnabled(true);
    } else {
      setMicEnabled(false);
    }
    console.log(`Microphone is now ${micEnabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.isSentByMe ? 'sent' : 'received'}`}>
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        {/* LLM Processing Status */}
        {isProcessingLLM && (
          <div className="llm-status processing">
            <span className="material-icons">psychology</span>
            Processing with AI...
          </div>
        )}
        
        {/* LLM Error Display */}
        {llmError && (
          <div className="llm-status error">
            <span className="material-icons">warning</span>
            LLM Error: {llmError}
          </div>
        )}
        
        <button
          onClick={toggleMicInternal}
          disabled={!connected}
          className={`icon-button ${!connected ? 'disabled' : ''}`}
          title={micEnabled ? 'Disable microphone' : 'Enable microphone'}
        >
          <span className="material-icons">{micEnabled ? 'mic' : 'mic_off'}</span>
        </button>
        {!micEnabled && (
          <>
            <input
              type="text"
              placeholder={isProcessingLLM ? 'Processing...' : 'Type a message...'}
              disabled={!connected || isProcessingLLM}
              className={!connected || isProcessingLLM ? 'disabled' : ''}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!connected || isProcessingLLM || !inputMessage.trim()}
              className={`icon-button ${!connected || isProcessingLLM || !inputMessage.trim() ? 'disabled' : ''}`}
              title="Send message"
            >
              <span className="material-icons">
                {isProcessingLLM ? 'hourglass_empty' : 'send'}
              </span>
            </button>
            <button
              onClick={() => interruptResponse(client)}
              disabled={!connected}
              className={`icon-button ${!connected ? 'disabled' : ''}`}
              title="Interrupt response"
            >
              <span className="material-icons">stop</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

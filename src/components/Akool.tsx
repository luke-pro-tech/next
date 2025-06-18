'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '../apiService';
import VideoDisplay from '../components/VideoDisplay';
import { useAudioControls } from '../hooks/useAudioControls';
import { useStreaming } from '../hooks/useStreaming';
import { useAgora } from '@/contexts/AgoraContext';
import { useMessageState } from '../hooks/useMessageState';

function Akool() {
  const { client } = useAgora();
  const { 
    micEnabled, 
    setMicEnabled, 
    toggleMic, 
    isTranscribing, 
    transcriptText, 
    isProcessingVoice, 
    isLLMProcessing: isAudioLLMProcessing,
    isSTTSupported 
  } = useAudioControls({
    enableSTT: true, // Enable Speech-to-Text
    enableLLMProcessing: true, // Enable LLM processing for voice
    onTranscription: (text) => {
      console.log('Voice transcribed:', text);
    },
    onLLMResponse: (response) => {
      console.log('LLM enhanced response:', response);
    }
  });

  const [modeType, setModeType] = useState(1);
  const [language, setLanguage] = useState('en');
  const [voiceId, setVoiceId] = useState('Xb7hH8MSUJpSbSDYk0k2');
  const [backgroundUrl, setBackgroundUrl] = useState('https://plus.unsplash.com/premium_photo-1697730373939-3ebcaa9d295e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2luZ2Fwb3JlfGVufDB8fDB8fHww');
  const [voiceUrl, setVoiceUrl] = useState('');

  const [openapiHost, setOpenapiHost] = useState('https://openapi.akool.com');
  const [avatarId, setAvatarId] = useState('UdzwXt51ZWRm92IIrhnGS');
//   const [avatarVideoUrl, setAvatarVideoUrl] = useState('https://drz0f01yeq1cx.cloudfront.net/1750241572718-4854-IMG2431.mov');
  const [avatarVideoUrl, setAvatarVideoUrl] = useState('http://localhost:3000/darren.mp4');


  const [openapiToken, setOpenapiToken] = useState('');
  const [sessionDuration, setSessionDuration] = useState(2);
  const [api, setApi] = useState<ApiService | null>(null);

  useEffect(() => {
    if (openapiHost && openapiToken) {
      setApi(new ApiService(openapiHost, openapiToken));
    }
  }, [openapiHost, openapiToken]);

  const { isJoined, connected, remoteStats, startStreaming, closeStreaming } = useStreaming(
    avatarId,
    sessionDuration,
    voiceId,
    language,
    modeType,
    api,
  );

  // Message handling for chat interface
  const handleStreamMessage = (uid: number, body: Uint8Array) => {
    const msg = new TextDecoder().decode(body);
    try {
      const { v, type, mid, pld } = JSON.parse(msg);
      if (v !== 2) {
        console.log(`unsupported message version, v=${v}`);
        return;
      }
      if (type === 'chat') {
        const { text } = pld;
        addReceivedMessage(`${type}_${mid}`, text);
        console.log(`Received chat message: ${text}`);
      }
    } catch (error) {
      console.error('Error parsing stream message:', error);
    }
  };

  // Chat state with LLM integration
  const { 
    messages, 
    inputMessage, 
    setInputMessage, 
    sendMessage, 
    addReceivedMessage,
    isProcessingLLM,
    llmError 
  } = useMessageState({
    client: client!,
    connected,
    onStreamMessage: handleStreamMessage,
    enableLLM: true, // Enable Bedrock LLM processing
  });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      
      {/* Full screen video display */}
      <VideoDisplay isJoined={isJoined} avatarVideoUrl={avatarVideoUrl} />
      
      {/* Glassmorphism status bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3 bg-red-500/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-white text-sm font-medium">AI Avatar Assistant</span>
        </div>
        
        {isJoined && (
          <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-md rounded-2xl px-4 py-2 border border-green-400/30">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-100 text-sm font-medium">Connected</span>
          </div>
        )}
      </div>
      
      {/* Voice Processing Status */}
      {(isTranscribing || isProcessingVoice || transcriptText) && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-80 max-w-sm px-4 z-20">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4">
            {/* Voice Status Indicators */}
            <div className="flex items-center gap-2 mb-2">
              {isTranscribing && (
                <div className="flex items-center gap-2 text-blue-300 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  Listening with Browser STT...
                </div>
              )}
              {isProcessingVoice && (
                <div className="flex items-center gap-2 text-purple-300 text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  Processing with AI...
                </div>
              )}
            </div>
            
            {/* STT Support Status */}
            {!isSTTSupported && (
              <div className="mb-2 text-red-300 text-xs">
                ⚠️ Speech recognition not supported in this browser
              </div>
            )}
            
            {/* Live Transcript */}
            {transcriptText && (
              <div className="bg-black/20 rounded-lg p-3">
                <p className="text-white/90 text-sm">
                  <span className="text-white/60">You said: </span>
                  {transcriptText}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Chat Interface - appears when connected and microphone is off */}
      {connected && !micEnabled && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-80 max-w-sm px-4 z-20">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4">
            {/* LLM Status - combine text and voice processing */}
            {(isProcessingLLM || isProcessingVoice) && (
              <div className="mb-3 flex items-center gap-2 text-blue-300 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                {isProcessingVoice ? 'Processing voice with AI...' : 'Processing message with AI...'}
              </div>
            )}
            
            {/* LLM Error */}
            {llmError && (
              <div className="mb-3 flex items-center gap-2 text-red-300 text-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                LLM Error: {llmError}
              </div>
            )}
            
            {/* Chat Messages */}
            {messages.length > 0 && (
              <div className="max-h-32 overflow-y-auto mb-3 space-y-2">
                {messages.slice(-3).map((message) => (
                  <div
                    key={message.id}
                    className={`text-sm p-2 rounded-lg ${
                      message.isSentByMe
                        ? 'bg-red-500/20 text-red-100 ml-4'
                        : 'bg-blue-500/20 text-blue-100 mr-4'
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
            )}
            
            {/* Chat Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isProcessingLLM ? 'Processing...' : 'Type your message...'}
                disabled={isProcessingLLM}
                className="flex-1 bg-white/10 border border-white/30 rounded-full px-4 py-2 text-white placeholder-white/70 text-sm focus:outline-none focus:border-red-400 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isProcessingLLM}
                className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isProcessingLLM ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Control buttons overlay - matching app's red theme */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex gap-3 p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl">
          <button
            onClick={startStreaming}
            disabled={isJoined}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors duration-200 shadow-md ${
              isJoined
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {isJoined ? 'Connected' : 'Start'}
          </button>
          
          <button
            onClick={closeStreaming}
            disabled={!isJoined}
            className="px-4 py-2 rounded-full font-medium text-sm transition-colors duration-200 shadow-md bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Stop
          </button>
          
          <button
            onClick={toggleMic}
            disabled={!connected}
            className={`px-4 py-2 rounded-full font-medium text-sm transition-colors duration-200 shadow-md ${
              micEnabled 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {micEnabled ? 'Mic On' : 'Muted'}
          </button>
        </div>
      </div>
      
      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      </div>
      
      {/* Connection status indicator */}
      {!isJoined && (
        <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 text-center z-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
            <p className="text-white/80 text-sm font-medium">Ready to connect with your AI assistant</p>
            <p className="text-white/60 text-xs mt-1">✨ Enhanced with Browser STT & AWS Bedrock LLM</p>
          </div>
        </div>
      )}
      
      {/* Chat instructions when connected */}
      {connected && !messages.length && (
        <div className="absolute bottom-44 left-1/2 transform -translate-x-1/2 text-center z-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
            <p className="text-white/80 text-sm font-medium">
              {micEnabled ? 'Speak to chat with your AI avatar' : 'Type below to chat with your AI avatar'}
            </p>
            <p className="text-white/60 text-xs mt-1">
              {isSTTSupported ? 'Browser STT + AWS Bedrock LLM' : 'Text messages processed by AWS Bedrock LLM'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Akool;

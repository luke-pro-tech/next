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
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      
      {/* Compact video display */}
      <VideoDisplay isJoined={isJoined} avatarVideoUrl={avatarVideoUrl} />
      
      {/* Compact status bar */}
      <div className="absolute top-1 left-2 right-2 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 bg-red-500/10 backdrop-blur-md rounded-lg px-2 py-1 border border-white/20">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
          <span className="text-white text-xs font-medium">AI Avatar</span>
        </div>
        
        {isJoined && (
          <div className="flex items-center gap-1 bg-green-500/20 backdrop-blur-md rounded-lg px-2 py-1 border border-green-400/30">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-100 text-xs font-medium">Live</span>
          </div>
        )}
      </div>
      
      {/* Compact control buttons overlay */}
      <div className="absolute bottom-1 right-2 z-30">
        <div className="flex gap-1 p-1 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20">
          <button
            onClick={startStreaming}
            disabled={isJoined}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
              isJoined
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white hover:bg-red-600'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {isJoined ? '●' : '▶'}
          </button>
          
          <button
            onClick={closeStreaming}
            disabled={!isJoined}
            className="px-2 py-1 rounded text-xs font-medium transition-colors duration-200 bg-gray-500 text-white hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ■
          </button>
          
          <button
            onClick={toggleMic}
            disabled={!connected}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-200 ${
              micEnabled 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            } disabled:bg-gray-400 disabled:cursor-not-allowed`}
          >
            {micEnabled ? '🎤' : '🔇'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Akool;

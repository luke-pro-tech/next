'use client';

import { useState, useEffect } from 'react';
import { ApiService } from '../apiService';
import VideoDisplay from '../components/VideoDisplay';
import { useAudioControls } from '../hooks/useAudioControls';
import { useStreaming } from '../hooks/useStreaming';
import { useAgora } from '@/contexts/AgoraContext';

function Akool() {
  const { client } = useAgora();
  const { micEnabled, setMicEnabled, toggleMic } = useAudioControls();

  const [modeType, setModeType] = useState(2);
  const [language, setLanguage] = useState('en');
  const [voiceId, setVoiceId] = useState('Xb7hH8MSUJpSbSDYk0k2');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');

  const [openapiHost, setOpenapiHost] = useState('https://openapi.akool.com');
  const [avatarId, setAvatarId] = useState('dvp_Tristan_cloth2_1080P');
  const [avatarVideoUrl, setAvatarVideoUrl] = useState('https://static.website-files.org/assets/avatar/avatar/streaming_avatar/tristan_10s_silence.mp4 ');

  const [openapiToken, setOpenapiToken] = useState('');
  const [sessionDuration, setSessionDuration] = useState(10);
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
      
      {/* Control buttons overlay - matching app's red theme */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
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
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center z-20">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
            <p className="text-white/80 text-sm font-medium">Ready to connect with your AI assistant</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Akool;

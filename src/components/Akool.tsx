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
    <div className="relative w-full h-screen overflow-hidden">
      {/* Full screen video display */}
      <VideoDisplay isJoined={isJoined} avatarVideoUrl={avatarVideoUrl} />
      
      {/* Control buttons overlay */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        <button
          onClick={startStreaming}
          disabled={isJoined}
          className="px-6 py-3 bg-green-500 text-white rounded-full disabled:bg-gray-400 hover:bg-green-600 transition-colors font-medium shadow-lg"
        >
          {isJoined ? 'Connected' : 'Start Avatar'}
        </button>
        
        <button
          onClick={closeStreaming}
          disabled={!isJoined}
          className="px-6 py-3 bg-red-500 text-white rounded-full disabled:bg-gray-400 hover:bg-red-600 transition-colors font-medium shadow-lg"
        >
          Stop
        </button>
        
        <button
          onClick={toggleMic}
          disabled={!connected}
          className={`px-6 py-3 text-white rounded-full transition-colors font-medium shadow-lg disabled:bg-gray-400 ${
            micEnabled ? 'bg-blue-500 hover:bg-blue-600' : 'bg-yellow-500 hover:bg-yellow-600'
          }`}
        >
          {micEnabled ? '🎤 On' : '🎤 Off'}
        </button>
      </div>
      
    </div>
  );
}

export default Akool;

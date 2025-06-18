'use client';

import { useState } from 'react';
import { useAgora } from '../contexts/AgoraContext';

export const useAudioControls = () => {
  const { client } = useAgora();
  const [micEnabled, setMicEnabled] = useState(false);
  let audioTrack: any = null;

  const toggleMic = async () => {
    if (!client) {
      console.warn('Agora client not initialized yet');
      return;
    }

    try {
      if (!micEnabled) {
        // Dynamic import AgoraRTC only when needed
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        
        audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: 'speech_low_quality',
          AEC: true,
          ANS: true,
          AGC: true,
        });
        await client.publish(audioTrack);
        setMicEnabled(true);
      } else {
        if (audioTrack) {
          audioTrack.stop();
          audioTrack.close();
          await client.unpublish(audioTrack);
          audioTrack = null;
        }
        setMicEnabled(false);
      }
      console.log(`Microphone is now ${micEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  return {
    micEnabled,
    setMicEnabled,
    toggleMic,
  };
};

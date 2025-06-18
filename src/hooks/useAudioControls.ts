'use client';

import { useState, useCallback } from 'react';
import { useAgora } from '../contexts/AgoraContext';
import { useBrowserSTT } from './useBrowserSTT';
import { useBedrockLLM } from './useBedrockLLM';
import { sendMessageToAvatarWithLLM } from '../agoraHelper';

interface UseAudioControlsOptions {
  enableLLMProcessing?: boolean;
  enableSTT?: boolean;
  onTranscription?: (text: string) => void;
  onLLMResponse?: (response: string) => void;
}

export const useAudioControls = (options: UseAudioControlsOptions = {}) => {
  const { 
    enableLLMProcessing = false, 
    enableSTT = false,
    onTranscription, 
    onLLMResponse 
  } = options;
  
  const { client } = useAgora();
  const [micEnabled, setMicEnabled] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  let audioTrack: any = null;

  const { processWithLLM, isProcessing: isLLMProcessing } = useBedrockLLM();

  // Handle transcription and LLM processing
  const handleTranscription = useCallback(async (transcribedText: string) => {
    try {
      console.log('Voice transcribed:', transcribedText);
      onTranscription?.(transcribedText);

      if (enableLLMProcessing && client) {
        setIsProcessingVoice(true);
        console.log('Processing with Bedrock LLM...');
        
        // Process with Bedrock LLM
        const enhancedText = await processWithLLM(transcribedText);
        console.log('LLM enhanced text:', enhancedText);
        onLLMResponse?.(enhancedText);

        // Send enhanced text to avatar instead of raw audio
        const messageId = `voice_${Date.now()}`;
        await sendMessageToAvatarWithLLM(client, messageId, transcribedText, processWithLLM);
      } else if (client) {
        // Send original transcription to avatar
        const messageId = `voice_${Date.now()}`;
        await sendMessageToAvatarWithLLM(client, messageId, transcribedText, async (text) => text);
      }
    } catch (error) {
      console.error('Error processing transcription:', error);
    } finally {
      setIsProcessingVoice(false);
    }
  }, [enableLLMProcessing, client, processWithLLM, onTranscription, onLLMResponse]);

  // Browser STT
  const { 
    isTranscribing, 
    transcriptText, 
    startTranscription, 
    stopTranscription,
    isSupported: isSTTSupported 
  } = useBrowserSTT({
    onTranscription: handleTranscription,
    onError: (error) => {
      console.error('STT Error:', error);
      setIsProcessingVoice(false);
    },
    continuous: true
  });

  const toggleMic = async () => {
    if (!client) {
      console.warn('Agora client not initialized yet');
      return;
    }

    try {
      if (!micEnabled) {
        if (enableSTT && isSTTSupported) {
          // Use Speech-to-Text mode
          console.log('Starting voice transcription...');
          await startTranscription();
        } else {
          // Use direct audio streaming mode
          const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
          
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: 'speech_low_quality',
            AEC: true,
            ANS: true,
            AGC: true,
          });
          await client.publish(audioTrack);
        }
        setMicEnabled(true);
      } else {
        if (enableSTT && isTranscribing) {
          // Stop speech transcription
          stopTranscription();
        }
        
        if (audioTrack) {
          // Stop direct audio streaming
          audioTrack.stop();
          audioTrack.close();
          await client.unpublish(audioTrack);
          audioTrack = null;
        }
        setMicEnabled(false);
      }
      
      console.log(`Microphone is now ${micEnabled ? 'enabled' : 'disabled'}`);
      if (enableSTT) {
        console.log(`STT mode: ${isSTTSupported ? 'supported' : 'not supported'}`);
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  return {
    micEnabled,
    setMicEnabled,
    toggleMic,
    isTranscribing,
    transcriptText,
    isProcessingVoice,
    isLLMProcessing,
    isSTTSupported,
  };
};

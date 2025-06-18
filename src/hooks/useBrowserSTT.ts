'use client';

import { useCallback, useState, useRef, useEffect } from 'react';

interface UseBrowserSTTOptions {
  onTranscription: (text: string) => void;
  onError?: (error: Error) => void;
  language?: string;
  continuous?: boolean;
}

export const useBrowserSTT = ({ 
  onTranscription, 
  onError, 
  language = 'en-US',
  continuous = true 
}: UseBrowserSTTOptions) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    setIsSupported(!!SpeechRecognition);
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser');
    }
  }, []);

  const startTranscription = useCallback(async () => {
    if (!isSupported) {
      const error = new Error('Speech recognition not supported in this browser');
      onError?.(error);
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsTranscribing(true);
        setTranscriptText('');
        console.log('Browser STT: Started listening');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update display with interim results
        const fullTranscript = finalTranscript + interimTranscript;
        setTranscriptText(fullTranscript);

        // Send final results to callback
        if (finalTranscript) {
          console.log('Browser STT: Final transcript:', finalTranscript);
          onTranscription(finalTranscript.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Browser STT error:', event.error);
        const error = new Error(`Speech recognition error: ${event.error}`);
        onError?.(error);
        setIsTranscribing(false);
      };

      recognition.onend = () => {
        console.log('Browser STT: Recognition ended');
        setIsTranscribing(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Browser STT initialization error:', error);
      onError?.(error as Error);
      setIsTranscribing(false);
    }
  }, [isSupported, language, continuous, onTranscription, onError]);

  const stopTranscription = useCallback(() => {
    if (recognitionRef.current && isTranscribing) {
      console.log('Browser STT: Stopping recognition');
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, [isTranscribing]);

  const restartTranscription = useCallback(() => {
    if (isTranscribing) {
      stopTranscription();
      // Restart after a brief delay
      setTimeout(() => {
        startTranscription();
      }, 100);
    }
  }, [isTranscribing, stopTranscription, startTranscription]);

  return {
    isTranscribing,
    transcriptText,
    startTranscription,
    stopTranscription,
    restartTranscription,
    isSupported
  };
};
'use client';

import { useState } from 'react';
import { useBrowserSTT } from '../../hooks/useBrowserSTT';
import { useBedrockLLM } from '../../hooks/useBedrockLLM';

export default function BrowserSTTTest() {
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [llmResponses, setLLMResponses] = useState<string[]>([]);
  
  const { processWithLLM, isProcessing: isLLMProcessing } = useBedrockLLM();

  const handleTranscription = async (text: string) => {
    console.log('Transcribed:', text);
    setTranscripts(prev => [...prev, text]);
    
    // Process with LLM if available
    try {
      const enhanced = await processWithLLM(text);
      setLLMResponses(prev => [...prev, enhanced]);
    } catch (error) {
      console.error('LLM processing failed:', error);
      setLLMResponses(prev => [...prev, `Error: ${error}`]);
    }
  };

  const { 
    isTranscribing, 
    transcriptText, 
    startTranscription, 
    stopTranscription,
    isSupported 
  } = useBrowserSTT({
    onTranscription: handleTranscription,
    onError: (error) => {
      console.error('STT Error:', error);
    },
    continuous: true
  });

  const clearResults = () => {
    setTranscripts([]);
    setLLMResponses([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Browser STT + AWS Bedrock LLM Test
        </h1>
        
        {/* Support Status */}
        <div className="mb-6 p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-2">Browser Support</h2>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isSupported 
              ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
              : 'bg-red-500/20 text-red-300 border border-red-400/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isSupported ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {isSupported ? 'Speech Recognition Supported' : 'Speech Recognition Not Supported'}
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
          <div className="flex gap-4">
            <button
              onClick={startTranscription}
              disabled={!isSupported || isTranscribing}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                isTranscribing
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-500 disabled:cursor-not-allowed'
              }`}
            >
              {isTranscribing ? 'Listening...' : 'Start Listening'}
            </button>
            
            <button
              onClick={stopTranscription}
              disabled={!isTranscribing}
              className="px-6 py-2 rounded-full font-medium bg-gray-500 hover:bg-gray-600 text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Stop
            </button>
            
            <button
              onClick={clearResults}
              className="px-6 py-2 rounded-full font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Live Transcript */}
        {transcriptText && (
          <div className="mb-6 p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-2">Live Transcript</h2>
            <p className="text-white/90">{transcriptText}</p>
          </div>
        )}

        {/* LLM Processing Status */}
        {isLLMProcessing && (
          <div className="mb-6 p-4 rounded-lg bg-blue-500/10 backdrop-blur-md border border-blue-400/30">
            <div className="flex items-center gap-2 text-blue-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Processing with AWS Bedrock LLM...
            </div>
          </div>
        )}

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Transcripts */}
          <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              Transcripts ({transcripts.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transcripts.map((transcript, index) => (
                <div key={index} className="p-3 bg-black/20 rounded-lg">
                  <span className="text-white/60 text-xs">#{index + 1}</span>
                  <p className="text-white/90 text-sm mt-1">{transcript}</p>
                </div>
              ))}
              {transcripts.length === 0 && (
                <p className="text-white/60 text-sm">No transcripts yet. Start speaking!</p>
              )}
            </div>
          </div>

          {/* LLM Responses */}
          <div className="p-4 rounded-lg bg-white/10 backdrop-blur-md border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              LLM Enhanced ({llmResponses.length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {llmResponses.map((response, index) => (
                <div key={index} className="p-3 bg-black/20 rounded-lg">
                  <span className="text-white/60 text-xs">#{index + 1}</span>
                  <p className="text-white/90 text-sm mt-1">{response}</p>
                </div>
              ))}
              {llmResponses.length === 0 && (
                <p className="text-white/60 text-sm">No LLM responses yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 rounded-lg bg-yellow-500/10 backdrop-blur-md border border-yellow-400/30">
          <h2 className="text-lg font-semibold text-yellow-300 mb-2">Instructions</h2>
          <ul className="text-yellow-200 text-sm space-y-1">
            <li>• Click "Start Listening" to begin speech recognition</li>
            <li>• Speak clearly into your microphone</li>
            <li>• Final transcripts will appear in the left panel</li>
            <li>• LLM enhanced versions will appear in the right panel</li>
            <li>• Works best in Chrome/Edge browsers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

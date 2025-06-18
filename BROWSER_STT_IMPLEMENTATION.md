# Browser Speech-to-Text (STT) Implementation

This document describes the Browser STT implementation for voice interactions in the travel app with AI avatar assistant.

## Overview

The Browser STT implementation uses the **Web Speech API** (specifically `SpeechRecognition`) to convert speech to text directly in the browser, eliminating the need for external speech recognition services like Amazon Transcribe.

## Features

### Core Features
- ✅ **Real-time Speech Recognition**: Uses browser's native speech recognition
- ✅ **Continuous Listening**: Supports continuous speech input
- ✅ **Interim Results**: Shows live transcription as user speaks
- ✅ **Final Transcripts**: Captures complete sentences/phrases
- ✅ **Browser Compatibility**: Works in Chrome, Edge, and Safari (with webkit prefix)
- ✅ **LLM Integration**: Seamlessly integrates with AWS Bedrock for text enhancement
- ✅ **Error Handling**: Comprehensive error handling with fallbacks

### Voice Processing Pipeline
```
User Speech → Browser STT → AWS Bedrock LLM → Enhanced Text → AI Avatar
```

## Implementation Details

### 1. Browser STT Hook (`useBrowserSTT.ts`)

```typescript
interface UseBrowserSTTOptions {
  onTranscription: (text: string) => void;
  onError?: (error: Error) => void;
  language?: string;
  continuous?: boolean;
}
```

**Key Features:**
- Automatic browser support detection
- Configurable language settings (default: 'en-US')
- Continuous vs. single-shot recognition modes
- Real-time interim and final results
- Comprehensive error handling

### 2. Audio Controls Integration (`useAudioControls.ts`)

**Options:**
- `enableSTT: boolean` - Enable Speech-to-Text mode
- `enableLLMProcessing: boolean` - Enable AWS Bedrock LLM processing
- `onTranscription: (text: string) => void` - Callback for transcribed text
- `onLLMResponse: (response: string) => void` - Callback for LLM enhanced text

**Modes:**
1. **Direct Audio Streaming**: Traditional microphone → Agora RTC
2. **STT + LLM Mode**: Speech → Browser STT → AWS Bedrock → Text → Avatar

### 3. UI Components

**Status Indicators:**
- Real-time listening status with animated indicators
- Browser support detection warnings
- Live transcript display during speech
- LLM processing status
- Voice vs. text processing differentiation

## Browser Compatibility

| Browser | Support Level | Notes |
|---------|---------------|-------|
| Chrome | ✅ Full | Best performance |
| Edge | ✅ Full | Excellent support |
| Firefox | ❌ No | No Web Speech API support |
| Safari | ⚠️ Partial | Requires webkit prefix, limited features |

## Configuration

### Environment Variables
No additional environment variables required for Browser STT.

AWS credentials still needed for LLM processing:
```bash
NEXT_PUBLIC_AWS_REGION=us-west-2
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your_key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret
```

### Component Usage

```tsx
const { 
  micEnabled, 
  toggleMic, 
  isTranscribing, 
  transcriptText, 
  isProcessingVoice, 
  isSTTSupported 
} = useAudioControls({
  enableSTT: true,
  enableLLMProcessing: true,
  onTranscription: (text) => console.log('Transcribed:', text),
  onLLMResponse: (response) => console.log('Enhanced:', response)
});
```

## Testing

### STT Test Page
Access `/stt-test` for isolated Browser STT testing:
- Browser support detection
- Live transcription testing
- LLM enhancement verification
- Results comparison

### Avatar Integration
Access `/avatar` for full avatar integration:
- Voice → STT → LLM → Avatar pipeline
- Real-time status indicators
- Mixed voice/text interactions

## Advantages vs. Amazon Transcribe

### Browser STT Advantages:
- ✅ **No API costs** - Completely free
- ✅ **No external dependencies** - Works offline
- ✅ **Low latency** - Real-time processing
- ✅ **Privacy** - No data sent to external servers
- ✅ **Simple setup** - No AWS credentials needed
- ✅ **Real-time results** - Immediate interim transcripts

### Limitations:
- ❌ **Browser dependency** - Limited to supported browsers
- ❌ **Language support** - Depends on browser capabilities
- ❌ **Accuracy** - May be less accurate than cloud services
- ❌ **No customization** - Can't train custom models

## Best Practices

### 1. Browser Detection
Always check `isSTTSupported` before enabling voice features:

```tsx
{isSTTSupported ? (
  <button onClick={toggleMic}>Start Voice</button>
) : (
  <p>Speech recognition not supported</p>
)}
```

### 2. Error Handling
Implement fallbacks for STT errors:

```typescript
const handleSTTError = (error: Error) => {
  console.error('STT Error:', error);
  // Fallback to text input
  setUseTextInput(true);
};
```

### 3. User Experience
- Show clear status indicators during listening
- Display live transcripts for user feedback
- Provide manual stop/start controls
- Handle automatic restarts for continuous mode

### 4. LLM Integration
Process transcribed text through Bedrock for enhanced responses:

```typescript
const enhancedText = await processWithLLM(transcribedText);
await sendMessageToAvatar(enhancedText);
```

## Troubleshooting

### Common Issues

1. **"Speech recognition not supported"**
   - Check browser compatibility
   - Ensure HTTPS connection (required for microphone access)
   - Try Chrome or Edge browsers

2. **Microphone permission denied**
   - Check browser permission settings
   - Ensure user grants microphone access
   - Test with other audio applications

3. **Poor recognition accuracy**
   - Speak clearly and at moderate pace
   - Reduce background noise
   - Check microphone quality
   - Consider switching languages

4. **Recognition stops unexpectedly**
   - Implement auto-restart logic
   - Handle `onend` events properly
   - Check for browser-specific timeout limits

## Future Enhancements

1. **Multi-language Support**: Dynamic language switching
2. **Custom Vocabulary**: Browser-specific vocabulary hints
3. **Noise Cancellation**: Pre-processing audio before recognition
4. **Offline Mode**: Cached model support where available
5. **Voice Commands**: Specific command recognition patterns

## Conclusion

The Browser STT implementation provides a robust, cost-effective solution for voice interactions in the AI avatar system. While it has some browser limitations, it offers excellent performance, privacy, and real-time capabilities for supported browsers.

The integration with AWS Bedrock LLM ensures that even simple voice inputs can be enhanced and made more intelligent before being sent to the avatar, creating a sophisticated conversational experience.

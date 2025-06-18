'use client';

import { useState, useEffect, useCallback } from 'react';
import { UID } from 'agora-rtc-sdk-ng/esm';
import { Session, ApiService, Credentials } from '../apiService';
import { setAvatarParams, log, StreamMessage, CommandResponsePayload } from '../agoraHelper';
import { NetworkStats } from '../components/NetworkQuality';
import { useAgora } from '../contexts/AgoraContext';

interface StreamingState {
  isJoined: boolean;
  connected: boolean;
  remoteStats: NetworkStats | null;
  session: Session | null;
}

export const useStreaming = (
  avatarId: string,
  sessionDuration: number,
  voiceId: string,
  language: string,
  modeType: number,
  api: ApiService | null,
) => {
  const { client } = useAgora();

  const [state, setState] = useState<StreamingState>({
    isJoined: false,
    connected: false,
    remoteStats: null,
    session: null,
  });

  // Helper function to update state partially
  const updateState = (newState: Partial<StreamingState>) => {
    setState((prevState) => ({ ...prevState, ...newState }));
  };

  // Event handlers
  const onException = useCallback((e: { code: number; msg: string; uid: UID }) => {
    log(e);
  }, []);

  const onTokenWillExpire = useCallback(() => {
    alert('Session will expire in 30s');
  }, []);

  const onTokenDidExpire = useCallback(() => {
    alert('Session expired');
    closeStreaming();
  }, []);

  const onUserPublish = useCallback(
    async (user: any, mediaType: 'video' | 'audio' | 'datachannel') => {
      log('onUserPublish', user, mediaType);
      if (!client) {
        console.warn('Agora client not initialized yet');
        return;
      }
      
      if (mediaType === 'video') {
        const remoteTrack = await client.subscribe(user, mediaType);
        remoteTrack.play('remote-video');
      } else if (mediaType === 'audio') {
        const remoteTrack = await client.subscribe(user, mediaType);
        remoteTrack.play();
      }
    },
    [client],
  );

  const onUserUnpublish = useCallback(
    async (user: any, mediaType: 'video' | 'audio' | 'datachannel') => {
      log('onUserUnpublish', user, mediaType);
      if (!client) {
        return;
      }
      await client.unsubscribe(user, mediaType);
    },
    [client],
  );

  const onStreamMessage = useCallback((uid: UID, body: Uint8Array) => {
    const msg = new TextDecoder().decode(body);
    log(`stream-message, uid=${uid}, size=${body.length}, msg=${msg}`);
    const { v, type, pld } = JSON.parse(msg) as StreamMessage;
    if (v !== 2) {
      log(`unsupported message version, v=${v}`);
      return;
    }
    if (type === 'cmd') {
      const { cmd, code, msg } = pld as CommandResponsePayload;
      log(`cmd-response, cmd=${cmd}, code=${code}, msg=${msg}`);
      if (code !== 1000) {
        alert(`cmd-response, cmd=${cmd}, code=${code}, msg=${msg}`);
      }
    }
  }, []);

  // Main functions
  const joinChannel = useCallback(
    async (credentials: Credentials) => {
      if (!client) {
        console.warn('Agora client not initialized yet');
        return;
      }

      const { agora_app_id, agora_channel, agora_token, agora_uid } = credentials;

      if (state.isJoined) {
        await leaveChannel();
      }

      client.on('exception', onException);
      client.on('user-published', onUserPublish);
      client.on('user-unpublished', onUserUnpublish);
      client.on('token-privilege-will-expire', onTokenWillExpire);
      client.on('token-privilege-did-expire', onTokenDidExpire);

      await client.join(agora_app_id, agora_channel, agora_token, agora_uid);

      client.on('network-quality', (stats: any) => {
        // Update remote stats
        const videoStats = client.getRemoteVideoStats();
        const audioStats = client.getRemoteAudioStats();
        const networkStats = client.getRemoteNetworkQuality();

        // Get the first remote user's stats
        const firstVideoStats = Object.values(videoStats)[0] || {};
        const firstAudioStats = Object.values(audioStats)[0] || {};
        const firstNetworkStats = Object.values(networkStats)[0] || {};

        updateState({
          remoteStats: {
            localNetwork: stats,
            remoteNetwork: firstNetworkStats,
            video: firstVideoStats,
            audio: firstAudioStats,
          },
        });
      });

      updateState({ isJoined: true });
    },
    [client, onException, onUserPublish, onUserUnpublish, onTokenWillExpire, onTokenDidExpire, state.isJoined],
  );

  const leaveChannel = useCallback(async () => {
    updateState({ isJoined: false });

    if (!client) {
      return;
    }

    client.removeAllListeners('exception');
    client.removeAllListeners('user-published');
    client.removeAllListeners('user-unpublished');
    client.removeAllListeners('token-privilege-will-expire');
    client.removeAllListeners('token-privilege-did-expire');

    await client.unpublish();
    await client.leave();
  }, [client]);

  const joinChat = useCallback(async () => {
    if (!client) {
      console.warn('Agora client not initialized yet');
      return;
    }

    client.on('stream-message', onStreamMessage);

    updateState({ connected: true });

    await setAvatarParams(client, {
      vid: voiceId,
      lang: language,
      mode: modeType,
    });
  }, [client, onStreamMessage, voiceId, language, modeType]);

  const leaveChat = useCallback(async () => {
    if (!client) {
      return;
    }

    client.removeAllListeners('stream-message');

    updateState({
      connected: false,
    });
  }, [client]);

  // Add effect to update avatar params when they change
  useEffect(() => {
    if (state.connected && client) {
      setAvatarParams(client, {
        vid: voiceId,
        lang: language,
        mode: modeType,
      });
    }
  }, [client, state.connected, voiceId, language, modeType]);

  const startStreaming = useCallback(async () => {
    if (!api) {
      alert('Please set host and token first');
      return;
    }

    const data = await api.createSession({
      avatar_id: avatarId,
      duration: sessionDuration * 60,
    });
    log(data);
    updateState({ session: data });

    const { stream_urls, credentials } = data;

    await joinChannel(credentials || stream_urls);
    await joinChat();
  }, [api, avatarId, sessionDuration, joinChannel, joinChat]);

  const closeStreaming = useCallback(async () => {
    await leaveChat();
    await leaveChannel();
    if (!state.session) {
      log('session not found');
      return;
    }
    await api?.closeSession(state.session._id);
  }, [api, leaveChat, leaveChannel, state.session]);

  // Clean up event listeners when component unmounts
  useEffect(() => {
    return () => {
      if (client) {
        client.removeAllListeners();
      }
    };
  }, [client]);

  return {
    ...state,
    startStreaming,
    closeStreaming,
  };
};

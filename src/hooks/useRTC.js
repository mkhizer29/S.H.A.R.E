import { useState, useCallback, useEffect } from 'react';

/**
 * Provider-agnostic RTC hook.
 * Currently returns mock data and timers, but abstracts the WebRTC or Zoom/Daily SDK logic.
 * The session is voice-first, with video as an optional toggle.
 */
export function useRTC(sessionId, initialVideo = false) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialVideo);
  const [duration, setDuration] = useState(0);
  const [remotePeers, setRemotePeers] = useState([]);

  useEffect(() => {
    // Mock connection sequence
    let timer;
    if (sessionId) {
      console.log(`[RTC Adapter] Connecting to session: ${sessionId}`);
      timer = setTimeout(() => {
        setIsConnected(true);
        // Mock remote peer joining
        setRemotePeers([{ id: 'peer-1', name: 'Dr. Sarah', hasVideo: false }]);
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [sessionId]);

  // Duration timer
  useEffect(() => {
    let interval;
    if (isConnected) {
      interval = setInterval(() => setDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const toggleAudio = useCallback(() => {
    // In a real app: localTracks.audio.setEnabled(!isAudioMuted)
    setIsAudioMuted((prev) => !prev);
  }, []);

  const toggleVideo = useCallback(() => {
    // In a real app: localTracks.video.setEnabled(!isVideoEnabled)
    setIsVideoEnabled((prev) => !prev);
  }, []);

  const leaveSession = useCallback(() => {
    console.log(`[RTC Adapter] Leaving session: ${sessionId}`);
    setIsConnected(false);
    setRemotePeers([]);
    setDuration(0);
  }, [sessionId]);

  const formattedDuration = `${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}`;

  return {
    isConnected,
    isAudioMuted,
    isVideoEnabled,
    duration: formattedDuration,
    remotePeers,
    toggleAudio,
    toggleVideo,
    leaveSession,
  };
}

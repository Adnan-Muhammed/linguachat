export const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export const RING_TIMEOUT_MS = 30_000; // 30 seconds before auto-cancel
export const CHANNEL_PREFIX = 'video-call:';

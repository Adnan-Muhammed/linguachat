export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected';

export interface CallInfo {
  peerId: string;
  peerName: string;
  isCaller: boolean;
}

export type SignalType =
  | 'call-offer'
  | 'call-answer'
  | 'ice-candidate'
  | 'call-rejected'
  | 'call-ended';

export interface SignalPayload {
  type: SignalType;
  from: string;
  fromName?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

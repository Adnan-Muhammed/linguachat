import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useApp } from '@/context/AppContext';
import { CallStatus, CallInfo, SignalPayload } from './types';
import { ICE_SERVERS, CHANNEL_PREFIX, RING_TIMEOUT_MS } from './constants';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useVideoCall() {
  const { db, toast } = useApp();
  const [supabase] = useState(() => createClient());
  const me = db.me;

  const [status, setStatus] = useState<CallStatus>('idle');
  const [callInfo, setCallInfo] = useState<CallInfo | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const personalChannelRef = useRef<RealtimeChannel | null>(null);
  const targetChannelRef = useRef<RealtimeChannel | null>(null);
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  const callInfoRef = useRef(callInfo);
  useEffect(() => { callInfoRef.current = callInfo; }, [callInfo]);

  const stopTracks = useCallback(() => {
    setLocalStream((prev) => {
      if (prev) prev.getTracks().forEach(t => t.stop());
      return null;
    });
    setRemoteStream((prev) => {
      if (prev) prev.getTracks().forEach(t => t.stop());
      return null;
    });
  }, []);

  const cleanupCall = useCallback(() => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    iceCandidateQueue.current = [];
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (targetChannelRef.current) {
      supabase.removeChannel(targetChannelRef.current);
      targetChannelRef.current = null;
    }
    stopTracks();
    setStatus('idle');
    setCallInfo(null);
    setIsMuted(false);
    setIsCameraOff(false);
  }, [supabase, stopTracks]);

  const sendSignal = useCallback((targetId: string, payload: SignalPayload) => {
    if (targetChannelRef.current && targetChannelRef.current.state === 'joined') {
      targetChannelRef.current.send({ type: 'broadcast', event: 'signal', payload });
    } else {
      const ch = supabase.channel(`${CHANNEL_PREFIX}${targetId}`);
      targetChannelRef.current = ch;
      ch.subscribe((state) => {
        if (state === 'SUBSCRIBED') {
          ch.send({ type: 'broadcast', event: 'signal', payload });
        }
      });
    }
  }, [supabase]);

  const processIceQueue = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;
    for (const candidate of iceCandidateQueue.current) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding queued ice candidate', e);
      }
    }
    iceCandidateQueue.current = [];
  }, []);

  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Failed to get local stream', err);
      toast('Could not access camera/microphone');
      return null;
    }
  };

  const createPeerConnection = useCallback((peerId: string) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    
    pc.onicecandidate = (event) => {
      if (event.candidate && me) {
        sendSignal(peerId, {
          type: 'ice-candidate',
          from: me.id,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream((prev) => {
        if (event.streams && event.streams[0]) {
          return new MediaStream(event.streams[0].getTracks());
        }
        const tracks = prev ? prev.getTracks() : [];
        if (!tracks.find(t => t.id === event.track.id)) {
          tracks.push(event.track);
        }
        return new MediaStream(tracks);
      });
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        toast('Call disconnected');
        cleanupCall();
      }
    };

    pcRef.current = pc;
    return pc;
  }, [me, sendSignal, toast, cleanupCall]);

  const startCall = async (peerId: string, peerName: string) => {
    if (!me || statusRef.current !== 'idle') return;

    const stream = await initLocalStream();
    if (!stream) return;

    setStatus('calling');
    setCallInfo({ peerId, peerName, isCaller: true });

    const pc = createPeerConnection(peerId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      sendSignal(peerId, {
        type: 'call-offer',
        from: me.id,
        fromName: me.name,
        sdp: offer,
      });

      ringTimeoutRef.current = setTimeout(() => {
        if (statusRef.current === 'calling') {
          sendSignal(peerId, { type: 'call-ended', from: me.id });
          cleanupCall();
          toast('No answer');
        }
      }, RING_TIMEOUT_MS);
    } catch (err) {
      console.error('Error starting call', err);
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    const info = callInfoRef.current;
    if (!me || !info || statusRef.current !== 'ringing') return;

    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }

    const stream = await initLocalStream();
    if (!stream) {
      rejectCall();
      return;
    }

    setStatus('connected');

    const pc = pcRef.current;
    if (!pc) return;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    try {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendSignal(info.peerId, {
        type: 'call-answer',
        from: me.id,
        sdp: answer,
      });
    } catch (err) {
      console.error('Error accepting call', err);
      cleanupCall();
    }
  };

  const rejectCall = useCallback(() => {
    const info = callInfoRef.current;
    if (!me || !info) return;
    
    sendSignal(info.peerId, { type: 'call-rejected', from: me.id });
    cleanupCall();
  }, [me, sendSignal, cleanupCall]);

  const endCall = useCallback(() => {
    const info = callInfoRef.current;
    if (!me || !info) return;
    
    sendSignal(info.peerId, { type: 'call-ended', from: me.id });
    cleanupCall();
  }, [me, sendSignal, cleanupCall]);

  const toggleMute = () => {
    setLocalStream((prev) => {
      if (prev) {
        prev.getAudioTracks().forEach(track => {
          track.enabled = !track.enabled;
        });
        setIsMuted(!prev.getAudioTracks()[0]?.enabled);
      }
      return prev;
    });
  };

  const toggleCamera = () => {
    setLocalStream((prev) => {
      if (prev) {
        prev.getVideoTracks().forEach(track => {
          track.enabled = !track.enabled;
        });
        setIsCameraOff(!prev.getVideoTracks()[0]?.enabled);
      }
      return prev;
    });
  };

  // Handle incoming signals
  const handleSignal = useCallback(async (payload: SignalPayload) => {
    const { type, from, fromName, sdp, candidate } = payload;
    if (!me || from === me.id) return;

    const currentStatus = statusRef.current;
    const currentInfo = callInfoRef.current;

    switch (type) {
      case 'call-offer':
        if (currentStatus !== 'idle') {
          // Busy
          sendSignal(from, { type: 'call-rejected', from: me.id });
          return;
        }
        
        const newPc = createPeerConnection(from);
        if (sdp) {
            await newPc.setRemoteDescription(new RTCSessionDescription(sdp));
            processIceQueue();
        }
        
        setStatus('ringing');
        setCallInfo({ peerId: from, peerName: fromName || 'Unknown', isCaller: false });
        
        ringTimeoutRef.current = setTimeout(() => {
          if (statusRef.current === 'ringing') {
            cleanupCall();
          }
        }, RING_TIMEOUT_MS);
        break;

      case 'call-answer':
        if (currentStatus === 'calling' && currentInfo?.peerId === from && pcRef.current && sdp) {
          if (ringTimeoutRef.current) {
            clearTimeout(ringTimeoutRef.current);
            ringTimeoutRef.current = null;
          }
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
          processIceQueue();
          setStatus('connected');
        }
        break;

      case 'ice-candidate':
        if (candidate) {
          const pc = pcRef.current;
          if (pc && pc.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (e) {
              console.error('Error adding ice candidate', e);
            }
          } else {
            iceCandidateQueue.current.push(candidate);
          }
        }
        break;

      case 'call-rejected':
        if (currentStatus === 'calling' && currentInfo?.peerId === from) {
          toast('Call declined');
          cleanupCall();
        }
        break;

      case 'call-ended':
        if (currentInfo?.peerId === from) {
          if (currentStatus === 'connected') toast('Call ended');
          cleanupCall();
        }
        break;
    }
  }, [me, sendSignal, cleanupCall, toast, createPeerConnection, processIceQueue]);

  useEffect(() => {
    if (!me?.id) return;
    
    const channelName = `${CHANNEL_PREFIX}${me.id}`;
    const channel = supabase.channel(channelName);
    
    channel.on('broadcast', { event: 'signal' }, ({ payload }) => {
      handleSignal(payload as SignalPayload);
    }).subscribe();

    personalChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [me?.id, supabase, handleSignal]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (statusRef.current !== 'idle' && callInfoRef.current && me) {
        sendSignal(callInfoRef.current.peerId, { type: 'call-ended', from: me.id });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupCall();
    };
  }, [me, sendSignal, cleanupCall]);

  return {
    status,
    callInfo,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera
  };
}

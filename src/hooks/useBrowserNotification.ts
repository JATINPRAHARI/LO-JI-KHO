import { useCallback, useRef, useEffect } from 'react';

// Singleton AudioContext that gets "unlocked" on first user interaction
let audioCtx: AudioContext | null = null;
let audioUnlocked = false;
const NOTIF_URL = '/mixkit-bell-notification-933.wav';

function unlockAudio() {
  if (audioUnlocked) return;
  try {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
    audioUnlocked = true;
  } catch { /* ignore */ }
}

function getAudioCtx(): AudioContext | null {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch { return null; }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function useBrowserNotification() {
  const permissionRequested = useRef(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default' && !permissionRequested.current) {
      permissionRequested.current = true;
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    function onInteract() {
      unlockAudio();
      document.removeEventListener('click', onInteract);
      document.removeEventListener('keydown', onInteract);
    }
    document.addEventListener('click', onInteract);
    document.addEventListener('keydown', onInteract);
    return () => {
      document.removeEventListener('click', onInteract);
      document.removeEventListener('keydown', onInteract);
    };
  }, []);

  const playSound = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;

      fetch(NOTIF_URL)
        .then(res => res.arrayBuffer())
        .then(data => ctx.decodeAudioData(data))
        .then(buffer => {
          const source = ctx.createBufferSource();
          const gain = ctx.createGain();
          source.buffer = buffer;
          gain.gain.setValueAtTime(1, ctx.currentTime); // MAX volume
          source.connect(gain);
          gain.connect(ctx.destination);
          source.start(0);
        })
        .catch(() => {
          // Fallback: oscillator beep
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1100, now);
          gain.gain.setValueAtTime(1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
        });
    } catch { /* ignore */ }
  }, []);

  const showBrowserNotification = useCallback((title: string, body?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(title, {
          body,
          icon: '/images/WhatsApp Image 2026-06-30 at 12.14.15 AM.jpeg',
          badge: '/images/WhatsApp Image 2026-06-30 at 12.14.15 AM.jpeg',
          tag: 'lo-ji-khao-' + Date.now(),
          requireInteraction: true,
        } as NotificationOptions);
        n.onclick = () => { window.focus(); n.close(); };
      } catch { /* ignore */ }
    }
  }, []);

  return { showBrowserNotification, playSound, requestPermission: useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []) };
}

import { useCallback, useRef, useEffect } from 'react';

let audioCtx: AudioContext | null = null;
let audioUnlocked = false;
const NOTIF_URL = '/mixkit-digital-clock-digital-alarm-buzzer-992.wav';

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

// Preload the WAV buffer once
let cachedBuffer: AudioBuffer | null = null;
let bufferLoading = false;

function preloadBuffer() {
  if (cachedBuffer || bufferLoading) return;
  bufferLoading = true;
  fetch(NOTIF_URL)
    .then(res => res.arrayBuffer())
    .then(data => {
      const ctx = getAudioCtx();
      if (ctx) {
        return ctx.decodeAudioData(data);
      }
      return null;
    })
    .then(buf => { cachedBuffer = buf; })
    .catch(() => { /* ignore */ });
}

export function useBrowserNotification() {
  const permissionRequested = useRef(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default' && !permissionRequested.current) {
      permissionRequested.current = true;
      Notification.requestPermission().catch(() => {});
    }
    // Preload the notification sound
    preloadBuffer();
  }, []);

  // Unlock audio on first interaction
  useEffect(() => {
    function onInteract() {
      unlockAudio();
      preloadBuffer();
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

      const playOnce = (buffer: AudioBuffer, delay: number, repeatCount: number) => {
        for (let i = 0; i < repeatCount; i++) {
          const source = ctx.createBufferSource();
          const gain = ctx.createGain();
          source.buffer = buffer;
          gain.gain.setValueAtTime(1, ctx.currentTime + delay + i * 0.8);
          source.connect(gain);
          gain.connect(ctx.destination);
          source.start(ctx.currentTime + delay + i * 0.8);
        }
      };

      if (cachedBuffer) {
        // Play 3 times with 0.8s gaps
        playOnce(cachedBuffer, 0, 3);
      } else {
        // Not cached yet - load and play
        fetch(NOTIF_URL)
          .then(res => res.arrayBuffer())
          .then(data => ctx.decodeAudioData(data))
          .then(buffer => {
            cachedBuffer = buffer;
            playOnce(buffer, 0, 3);
          })
          .catch(() => {
            // Fallback oscillator
            const now = ctx.currentTime;
            for (let i = 0; i < 3; i++) {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(1100, now + i * 0.3);
              gain.gain.setValueAtTime(1, now + i * 0.3);
              gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.3 + 0.25);
              osc.start(now + i * 0.3);
              osc.stop(now + i * 0.3 + 0.25);
            }
          });
      }
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

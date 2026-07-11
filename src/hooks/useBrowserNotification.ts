import { useCallback, useRef, useEffect } from 'react';

// Singleton AudioContext that gets "unlocked" on first user interaction
let audioCtx: AudioContext | null = null;
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  try {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    // Play silent buffer to unlock
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

  // Auto-request permission on mount
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default' && !permissionRequested.current) {
      permissionRequested.current = true;
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Listen for first user interaction to unlock audio
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

      const now = ctx.currentTime;

      // Beep 1 - 880Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(1, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Beep 2 - 1100Hz (delayed)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1100, now + 0.15);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(1, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.45);

      // Beep 3 - 1320Hz (louder)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1320, now + 0.3);
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.setValueAtTime(1, now + 0.3);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc3.start(now + 0.3);
      osc3.stop(now + 0.6);
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

import { useCallback, useRef, useEffect } from 'react';

let audioCtx: AudioContext | null = null;
let audioUnlocked = false;
const ALARM_URL = '/mixkit-digital-clock-digital-alarm-buzzer-992.wav';
const BELL_URL = '/mixkit-bell-notification-933.wav';

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

// Preload buffers once
let alarmBuffer: AudioBuffer | null = null;
let bellBuffer: AudioBuffer | null = null;

function preloadBuffer(url: string): Promise<AudioBuffer | null> {
  const ctx = getAudioCtx();
  if (!ctx) return Promise.resolve(null);
  return fetch(url)
    .then(res => res.arrayBuffer())
    .then(data => ctx.decodeAudioData(data))
    .catch(() => null);
}

function playBuffer(buffer: AudioBuffer, repeatCount: number, gap: number) {
  const ctx = getAudioCtx();
  if (!ctx || !buffer) return;
  for (let i = 0; i < repeatCount; i++) {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(1, ctx.currentTime + i * gap);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime + i * gap);
  }
}

function fallbackBeep() {
  const ctx = getAudioCtx();
  if (!ctx) return;
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
}

export function useBrowserNotification() {
  const permissionRequested = useRef(false);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default' && !permissionRequested.current) {
      permissionRequested.current = true;
      Notification.requestPermission().catch(() => {});
    }
    // Preload both sounds
    preloadBuffer(ALARM_URL).then(buf => { if (buf) alarmBuffer = buf; });
    preloadBuffer(BELL_URL).then(buf => { if (buf) bellBuffer = buf; });
  }, []);

  useEffect(() => {
    function onInteract() {
      unlockAudio();
      preloadBuffer(ALARM_URL).then(buf => { if (buf) alarmBuffer = buf; });
      preloadBuffer(BELL_URL).then(buf => { if (buf) bellBuffer = buf; });
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

  // Admin: loud alarm buzzer x3
  const playAlarmSound = useCallback(() => {
    if (alarmBuffer) {
      playBuffer(alarmBuffer, 3, 0.8);
    } else {
      preloadBuffer(ALARM_URL).then(buf => {
        if (buf) { alarmBuffer = buf; playBuffer(buf, 3, 0.8); }
        else fallbackBeep();
      });
    }
  }, []);

  // Customer: gentle bell x1
  const playBellSound = useCallback(() => {
    if (bellBuffer) {
      playBuffer(bellBuffer, 1, 0);
    } else {
      preloadBuffer(BELL_URL).then(buf => {
        if (buf) { bellBuffer = buf; playBuffer(buf, 1, 0); }
      });
    }
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

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  return { showBrowserNotification, playAlarmSound, playBellSound, requestPermission };
}

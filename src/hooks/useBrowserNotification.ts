import { useCallback } from 'react';

export function useBrowserNotification() {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission === 'denied') {
      return false;
    }
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  const playSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.15);

      gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.4);

      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1100, audioCtx.currentTime);
        gain2.gain.setValueAtTime(1, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc2.start(audioCtx.currentTime);
        osc2.stop(audioCtx.currentTime + 0.3);
      }, 200);
    } catch {
      // Audio not supported
    }
  }, []);

  const showNotification = useCallback(async (title: string, options?: { body?: string; icon?: string; badge?: string }) => {
    const permitted = await requestPermission();
    if (permitted) {
      try {
        const n = new Notification(title, {
          icon: '/images/WhatsApp Image 2026-06-30 at 12.14.15 AM.jpeg',
          badge: '/images/WhatsApp Image 2026-06-30 at 12.14.15 AM.jpeg',
          tag: 'lo-ji-khao-notification',
          requireInteraction: true,
          ...options,
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch {
        // Notification failed
      }
    }
    playSound();
  }, [requestPermission, playSound]);

  return { showNotification, requestPermission };
}

export function playNotificationSound(kind: "partner" | "admin") {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const notes = kind === "admin" ? [740, 520, 880] : [660, 880];
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.12;
      oscillator.type = kind === "admin" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(kind === "admin" ? 0.13 : 0.1, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(start); oscillator.stop(start + 0.2);
    });
    window.setTimeout(() => void context.close(), 900);
  } catch { /* Browser ses izni kapalıysa sessiz devam et. */ }
}

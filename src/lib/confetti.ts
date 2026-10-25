import confetti from 'canvas-confetti';

export function fireSuccessConfetti() {
  try {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#5856E9', '#1877F2', '#E1306C', '#FF0033', '#16A34A'],
    });
  } catch (e) {
    // ignore
  }
}

import confetti from 'canvas-confetti';

export function triggerConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#6366f1', '#10b981', '#38bdf8', '#fb7185', '#a855f7'],
  });
}


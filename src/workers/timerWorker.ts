let timerInterval: number | null = null;
let timeLeft = 0;

self.onmessage = (e) => {
  const { type, duration } = e.data;

  if (type === 'START') {
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = duration;
    timerInterval = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        clearInterval(timerInterval!);
        timerInterval = null;
        self.postMessage({ type: 'COMPLETE' });
      } else {
        self.postMessage({ type: 'TICK', timeLeft });
      }
    }, 1000) as any;
  } else if (type === 'PAUSE' || type === 'STOP') {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }
};

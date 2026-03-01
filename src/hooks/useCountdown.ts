import { useState, useEffect } from 'react';

export function useCountdown(reportedAt: number, slaHours: number) {
  const deadline = reportedAt + slaHours * 3600000;
  const [ms, setMs] = useState(() => deadline - Date.now());
  
  useEffect(() => {
    const t = setInterval(() => setMs(deadline - Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);
  
  const breached = ms < 0;
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const pct = Math.max(0, Math.min(100, (ms / (slaHours * 3600000)) * 100));
  
  return { breached, h, m, pct, urgent: !breached && h < 6 };
}

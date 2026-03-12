import { useState, useEffect } from 'react';
import { formatTime } from '../lib/utils';

export function LiveTimer({ startTime }: { startTime: number }) {
  const [seconds, setSeconds] = useState(() => Math.floor((Date.now() - startTime) / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono">{formatTime(seconds)}</span>;
}

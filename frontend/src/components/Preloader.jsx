import { useEffect, useRef } from 'react';

const START_PROGRESS = 2;
const MAX_PROGRESS = 90;
const TICK_MS = 90;

function getNextProgress(currentProgress) {
  const remaining = MAX_PROGRESS - currentProgress;
  const step = Math.max(remaining * 0.08, 1.5);
  return Math.min(currentProgress + step, MAX_PROGRESS);
}

export default function Preloader() {
  const barRef = useRef(null);

  useEffect(() => {
    let progress = START_PROGRESS;

    if (barRef.current) {
      barRef.current.style.width = `${progress}%`;
    }

    const interval = setInterval(() => {
      progress = getNextProgress(progress);

      if (barRef.current) {
        barRef.current.style.width = `${progress}%`;
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="preloader">
      <div className="preloader-logo">nexory-dev.de</div>
      <div className="preloader-bar">
        <div className="preloader-bar-inner" ref={barRef} />
      </div>
    </div>
  );
}

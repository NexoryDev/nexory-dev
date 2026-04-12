import { useEffect, useRef } from 'react';

const START_PROGRESS = 5;
const MAX_PROGRESS = 90;
const TICK_MS = 120;

function getNextProgress(currentProgress) {
  return Math.min(currentProgress + Math.random() * 18 + 5, MAX_PROGRESS);
}

export default function Preloader() {
  const barRef = useRef(null);

  useEffect(() => {
    let progress = START_PROGRESS;

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

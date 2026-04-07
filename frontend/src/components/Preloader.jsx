import { useEffect, useRef } from 'react';

export default function Preloader() {
  const barRef = useRef(null);

  useEffect(() => {
    let progress = 5;

    const interval = setInterval(() => {
      progress = Math.min(progress + Math.random() * 18 + 5, 90);
      if (barRef.current) {
        barRef.current.style.width = progress + '%';
      }
    }, 120);

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

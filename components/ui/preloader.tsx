"use client";

import { useEffect, useState } from 'react';

export function Preloader() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Animate width from 0 to 100
    const timer = setTimeout(() => {
      setWidth(100);
    }, 100); // Start animation shortly after component mounts

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999]">
      <div 
        className="h-full bg-primary shadow-[0_0_10px] shadow-primary transition-all duration-[800ms] ease-in-out"
        style={{ width: `${width}%` }}
      ></div>
    </div>
  );
}

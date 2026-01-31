import { useEffect, useRef } from 'react';

const Container = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let resizeObserver: ResizeObserver;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      // Handle resize logic here
    };

    if (containerRef.current) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [containerRef]);

  return <div ref={containerRef}>Container content</div>;
}
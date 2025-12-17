import { useEffect, useRef, useState, VideoHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  intersectionOptions?: IntersectionObserverInit;
}

export function LazyVideo({
  src,
  showSkeleton = true,
  skeletonClassName,
  intersectionOptions = { rootMargin: '50px' },
  ...videoProps
}: LazyVideoProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, intersectionOptions);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [intersectionOptions]);

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {shouldLoad ? (
        <>
          {showSkeleton && !isLoaded && (
            <Skeleton className={`absolute inset-0 ${skeletonClassName || ''}`} />
          )}
          <video
            ref={videoRef}
            src={src}
            onLoadedData={handleLoadedData}
            preload="none"
            {...videoProps}
          />
        </>
      ) : (
        showSkeleton && (
          <Skeleton className={`w-full h-full ${skeletonClassName || ''}`} />
        )
      )}
    </div>
  );
}

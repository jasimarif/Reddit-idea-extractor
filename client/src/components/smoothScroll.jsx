import { useEffect, useRef, useState } from 'react';

// Custom hook for smooth scrolling with inertia
export const useSmoothScroll = (options = {}) => {
  const {
    inertia = 0.1,        // Lower = more inertia
    friction = 0.9,       // Higher = less friction
    scrollSpeed = 1,      // Scroll sensitivity
    touchMultiplier = 2,  // Touch sensitivity
  } = options;

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const scrollDataRef = useRef({
    scrollY: 0,
    targetScrollY: 0,
    velocity: 0,
    maxScroll: 0,
    isAnimating: false,
  });

  const [isEnabled, setIsEnabled] = useState(true);

  // Calculate maximum scroll distance
  const calculateMaxScroll = () => {
    if (containerRef.current && contentRef.current) {
      scrollDataRef.current.maxScroll = 
        contentRef.current.scrollHeight - containerRef.current.clientHeight;
    }
  };

  // Clamp scroll position
  const clampScroll = (value) => {
    return Math.max(0, Math.min(scrollDataRef.current.maxScroll, value));
  };

  // Animation loop
  const animate = () => {
    if (!isEnabled) return;

    const data = scrollDataRef.current;
    
    // Calculate velocity with inertia
    data.velocity += (data.targetScrollY - data.scrollY) * inertia;
    data.velocity *= friction;
    data.scrollY += data.velocity;

    // Apply transform
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(${-data.scrollY}px)`;
    }

    // Continue animation if there's significant velocity
    if (Math.abs(data.velocity) > 0.1) {
      data.isAnimating = true;
      requestAnimationFrame(animate);
    } else {
      data.isAnimating = false;
    }
  };

  // Start animation if not already running
  const startAnimation = () => {
    if (!scrollDataRef.current.isAnimating) {
      animate();
    }
  };

  // Scroll to target position
  const scrollTo = (targetY) => {
    scrollDataRef.current.targetScrollY = clampScroll(targetY);
    startAnimation();
  };

  // Scroll by delta amount
  const scrollBy = (deltaY) => {
    scrollDataRef.current.targetScrollY = clampScroll(
      scrollDataRef.current.targetScrollY + deltaY
    );
    startAnimation();
  };

  useEffect(() => {
    if (!isEnabled) return;

    const container = containerRef.current;
    if (!container) return;

    calculateMaxScroll();

    // Mouse wheel handler
    const handleWheel = (e) => {
      e.preventDefault();
      scrollBy(e.deltaY * scrollSpeed);
    };

    // Touch handlers
    let touchStartY = 0;
    let touchStartScrollY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartScrollY = scrollDataRef.current.targetScrollY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const deltaY = (touchStartY - touchY) * touchMultiplier;
      scrollDataRef.current.targetScrollY = clampScroll(
        touchStartScrollY + deltaY
      );
      startAnimation();
    };

    // Keyboard handler
    const handleKeyDown = (e) => {
      const viewportHeight = window.innerHeight;
      
      switch (e.key) {
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          scrollBy(viewportHeight * 0.8);
          break;
        case 'ArrowUp':
          e.preventDefault();
          scrollBy(-viewportHeight * 0.8);
          break;
        case 'Home':
          e.preventDefault();
          scrollTo(0);
          break;
        case 'End':
          e.preventDefault();
          scrollTo(scrollDataRef.current.maxScroll);
          break;
      }
    };

    // Resize handler
    const handleResize = () => {
      calculateMaxScroll();
    };

    // Add event listeners
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isEnabled, inertia, friction, scrollSpeed, touchMultiplier]);

  return {
    containerRef,
    contentRef,
    scrollTo,
    scrollBy,
    isEnabled,
    setIsEnabled,
    currentScrollY: scrollDataRef.current.scrollY,
  };
};

// Example React component using the hook
export const SmoothScrollContainer = ({ children, className = '', ...options }) => {
  const { containerRef, contentRef, isEnabled, setIsEnabled } = useSmoothScroll(options);

  useEffect(() => {
    // Prevent default body scrolling when enabled
    if (isEnabled) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isEnabled]);

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 w-full h-screen overflow-hidden ${className}`}
      style={{ 
        position: isEnabled ? 'fixed' : 'static',
        height: isEnabled ? '100vh' : 'auto',
        overflow: isEnabled ? 'hidden' : 'visible'
      }}
    >
      <div
        ref={contentRef}
        className="absolute top-0 left-0 w-full"
        style={{
          position: isEnabled ? 'absolute' : 'static',
          transform: isEnabled ? undefined : 'none',
          willChange: isEnabled ? 'transform' : 'auto'
        }}
      >
        {children}
      </div>
    </div>
  );
};
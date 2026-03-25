import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect scroll direction (up or down)
 * Returns { isScrollingDown, scrollY }
 */
export function useScrollDirection() {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const prevScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      if (currentScrollY > prevScrollYRef.current) {
        // Scrolling down
        if (!isScrollingDown) {
          setIsScrollingDown(true);
        }
      } else if (currentScrollY < prevScrollYRef.current) {
        // Scrolling up
        if (isScrollingDown) {
          setIsScrollingDown(false);
        }
      }

      prevScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrollingDown]);

  return { isScrollingDown, scrollY };
}

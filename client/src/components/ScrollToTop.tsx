import { memo, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = (): null => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use requestAnimationFrame for smooth scrolling
    let frameId: number;
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // Use setTimeout to ensure DOM is ready before scrolling
    const timeoutId = setTimeout(() => {
      frameId = requestAnimationFrame(scrollToTop);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [pathname]);

  return null;
};

export default memo(ScrollToTop);

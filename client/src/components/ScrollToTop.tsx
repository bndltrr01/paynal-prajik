import { memo, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = (): null => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    requestAnimationFrame(scrollToTop);
  }, [pathname]);

  return null;
};

export default memo(ScrollToTop);

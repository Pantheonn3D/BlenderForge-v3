import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// This component's only job is to scroll to the top when the route changes.
const ScrollToTop = () => {
  // Get the current location object from React Router
  const { pathname } = useLocation();

  // Use an effect that runs every time the pathname changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]); // The effect dependency is the pathname

  // This component doesn't render anything to the page
  return null;
};

export default ScrollToTop;
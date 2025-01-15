import { useEffect, useState } from 'react';
import debounce from 'lodash/debounce';

const useIsMobile = (): boolean => {
  // Initialize with null to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip effect on server side
    if (typeof window === 'undefined') return;

    const updateSize = debounce((): void => {
      setIsMobile(window.innerWidth < 768);
    }, 250);

    // Initial check
    updateSize();

    window.addEventListener('resize', updateSize);
    return (): void => window.removeEventListener('resize', updateSize);
  }, []);

  // Return false during SSR, actual value after hydration
  return isMobile ?? false;
};

export default useIsMobile;

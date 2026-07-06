import { useEffect, useRef, useState } from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface TopBarProps {
  onStoreLocatorClick?: () => void;
}

/**
 * Slim green info bar shown above the main header.
 *
 * Visibility behaviour:
 *  - Visible at the top of the page.
 *  - Hides when the user scrolls DOWN.
 *  - Reappears when the user scrolls UP.
 *
 * Implemented by tracking the previous scroll position on every scroll event
 * and toggling a "visible" state. The state flips after a small delta so
 * micro-scrolls (e.g. trackpad wobble) don't cause flicker.
 */
export function TopBar({ onStoreLocatorClick }: TopBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        // Always show the bar near the very top of the page, no matter what.
        if (currentScrollY < 8) {
          setIsVisible(true);
        } else {
          // Compare with the previous position: scrolling down hides,
          // scrolling up shows.
          if (currentScrollY > lastScrollY.current) {
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY.current) {
            setIsVisible(true);
          }
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    // Make sure we always start from a known state on mount.
    lastScrollY.current = window.scrollY;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="bg-green-700 text-sm font-medium text-white overflow-hidden transition-all duration-300 ease-in-out flex items-center"
      style={{
        height: isVisible ? '40px' : '0px',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            +94 11 234 5678
          </span>
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            supermarketusj@gmail.com
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onStoreLocatorClick}
            className="flex items-center gap-1 hover:text-green-200 transition-colors focus:outline-none"
          >
            <MapPin className="w-4 h-4" />
            Store Locator
          </button>
        </div>
      </div>
    </div>
  );
}
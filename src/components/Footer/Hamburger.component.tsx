import { useReducer, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

import FadeLeftToRight from '@/components/Animations/FadeLeftToRight.component';
import FadeLeftToRightItem from '@/components/Animations/FadeLeftToRightItem.component';

import LINKS from '@/utils/constants/LINKS';

const hamburgerLine =
  'h-1 w-10 my-1 rounded-full bg-white transition ease transform duration-300 not-sr-only';

const opacityFull = 'opacity-100 group-hover:opacity-100';

// --- Reducer ---

interface HamburgerState {
  isExpanded: boolean;
  hidden: string;
  isAnimating: boolean;
}

type HamburgerAction =
  | { type: 'EXPAND' }
  | { type: 'COLLAPSE' }
  | { type: 'ANIMATION_END_EXPANDED' }
  | { type: 'ANIMATION_END_COLLAPSED' }
  | { type: 'TOGGLE' };

const initialState: HamburgerState = {
  isExpanded: false,
  hidden: 'invisible',
  isAnimating: false,
};

function hamburgerReducer(
  state: HamburgerState,
  action: HamburgerAction,
): HamburgerState {
  switch (action.type) {
    case 'TOGGLE':
      if (state.isAnimating) return state;
      return state.isExpanded
        ? { ...state, isExpanded: false, isAnimating: true }
        : { ...state, isExpanded: true, hidden: '', isAnimating: true };
    case 'ANIMATION_END_EXPANDED':
      return { ...state, isAnimating: false };
    case 'ANIMATION_END_COLLAPSED':
      return { ...state, hidden: 'invisible', isAnimating: false };
    default:
      return state;
  }
}

/**
 * Hamburger component used in mobile menu. Animates to a X when clicked
 * @function Hamburger
 * @param {MouseEventHandler<HTMLButtonElement>} onClick - onClick handler to respond to clicks
 * @param {boolean} isExpanded - Should the hamburger animate to a X?
 * @returns {JSX.Element} - Rendered component
 */

const Hamburger = () => {
  const [state, dispatch] = useReducer(hamburgerReducer, initialState);
  const { isExpanded, hidden, isAnimating } = state;
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    if (!isAnimating) return;

    animationTimeoutRef.current = setTimeout(() => {
      dispatch(
        isExpanded
          ? { type: 'ANIMATION_END_EXPANDED' }
          : { type: 'ANIMATION_END_COLLAPSED' },
      );
    }, 1000);

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [isExpanded, isAnimating]);

  const handleMobileMenuClick = useCallback(() => {
    dispatch({ type: 'TOGGLE' });
  }, []);

  return (
    <div className="z-50 md:hidden lg:hidden xl:hidden bg-blue-800">
      <button
        className={`flex flex-col w-16 rounded justify-center items-center group ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        data-cy="hamburger"
        data-testid="hamburger"
        onClick={handleMobileMenuClick}
        aria-expanded={isExpanded}
        disabled={isAnimating}
        type="button"
      >
        <span className="sr-only text-white text-2xl">Hamburger</span>
        <span
          data-testid="hamburgerline"
          className={`${hamburgerLine} ${
            isExpanded
              ? 'rotate-45 translate-y-3 opacity-100 group-hover:opacity-100'
              : opacityFull
          }`}
        />
        <span
          className={`${hamburgerLine} ${
            isExpanded ? 'opacity-0' : opacityFull
          }`}
        />
        <span
          className={`${hamburgerLine} ${
            isExpanded
              ? '-rotate-45 -translate-y-3 opacity-100 group-hover:opacity-100'
              : opacityFull
          }`}
        />
      </button>
      <FadeLeftToRight
        delay={0.2}
        staggerDelay={0.2}
        animateNotReverse={isExpanded}
      >
        <div
          id="mobile-menu"
          aria-hidden={!isExpanded}
          className={`absolute left-0 bottom-24 z-10 w-full text-center text-black bg-white ${hidden}`}
        >
          <ul>
            {LINKS.map(({ id, title, href }) => (
              <FadeLeftToRightItem key={id} cssClass="block">
                <li
                  id="mobile-li"
                  className="w-full p-4 border-t border-gray-400 border-solid rounded"
                >
                  <Link href={href} passHref>
                    <span
                      className="text-xl inline-block px-4 py-2 no-underline hover:text-black hover:underline"
                      onClick={() => {
                        if (!isAnimating) {
                          dispatch({ type: 'TOGGLE' });
                        }
                      }}
                      onKeyDown={(event) => {
                        // 'Enter' key or 'Space' key
                        if (
                          (event.key === 'Enter' || event.key === ' ') &&
                          !isAnimating
                        ) {
                          dispatch({ type: 'TOGGLE' });
                        }
                      }}
                      tabIndex={0} // Make the span focusable
                      role="button" // Indicate the span acts as a button
                    >
                      {title}
                    </span>
                  </Link>
                </li>
              </FadeLeftToRightItem>
            ))}
          </ul>
        </div>
      </FadeLeftToRight>
    </div>
  );
};

export default Hamburger;

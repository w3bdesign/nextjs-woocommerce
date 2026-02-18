import { LazyMotion, domAnimation, m, Transition } from 'motion/react';

import type { IAnimateStaggerWithDelayProps } from './types/Animations.types';

/**
 * Fade content left to right. Needs to be used with FadeLeftToRightItem
 * @function FadeLeftToRight
 * @param {ReactNode} children - Children content to render
 * @param {string} cssClass - CSS classes to apply to component
 * @param {number} delay - Time to wait before starting animation
 * @param {number} staggerDelay - Time to wait before starting animation for children items
 * @param {boolean} animateNotReverse - Start animation backwards
 * @returns {JSX.Element} - Rendered component
 */

const FadeLeftToRight = ({
  children,
  cssClass,
  delay,
  staggerDelay,
  animateNotReverse,
}: IAnimateStaggerWithDelayProps) => {
  const visibleTransition: Transition = {
    when: 'beforeChildren',
    staggerChildren: staggerDelay ? staggerDelay : 0.5,
    delay,
    ease: 'easeInOut',
    staggerDirection: 1,
  };

  const hiddenTransition: Transition = {
    when: 'afterChildren',
    staggerChildren: staggerDelay ? staggerDelay : 0.5,
    staggerDirection: -1,
  };

  const FadeLeftToRightVariants = {
    visible: {
      opacity: 1,
      transition: visibleTransition,
    },
    hidden: {
      opacity: 0,
      transition: hiddenTransition,
    },
  };
  return (
    <LazyMotion features={domAnimation}>
      <m.div
        initial="hidden"
        animate={animateNotReverse ? 'visible' : 'hidden'}
        variants={FadeLeftToRightVariants}
        className={cssClass}
        data-testid="fadelefttoright"
      >
        {children}
      </m.div>
    </LazyMotion>
  );
};

export default FadeLeftToRight;

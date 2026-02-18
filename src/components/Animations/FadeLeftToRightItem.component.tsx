import { m, Transition } from 'motion/react';

import type { IAnimateProps } from './types/Animations.types';

/**
 * Fade content left to right. Needs to be used with FadeLeftToRight as parent container
 * @function FadeLeftToRightItem
 * @param {ReactNode} children - Children content to render
 * @param {string} cssClass - CSS classes to apply to component
 * @returns {JSX.Element} - Rendered component
 */

const FadeLeftToRightItem = ({ children, cssClass }: IAnimateProps) => {
  const transition: Transition = {
    type: 'spring',
    duration: 0.5,
    stiffness: 110,
  };

  const fadeLeftToRightItemVariants = {
    visible: {
      opacity: 1,
      x: 0,
      transition,
    },
    hidden: { opacity: 0, x: -20 },
  };
  return (
    <m.span
      variants={fadeLeftToRightItemVariants}
      className={cssClass}
      data-testid="fadelefttorightitem"
    >
      {children}
    </m.span>
  );
};

export default FadeLeftToRightItem;

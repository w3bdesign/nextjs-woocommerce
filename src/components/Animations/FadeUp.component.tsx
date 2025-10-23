import { motion, Transition } from 'motion/react';

import type { IAnimateWithDelayProps } from './types/Animations.types';

/**
 * Fade up content animation
 * @function FadeUp
 * @param {ReactNode} children - Children content to render
 * @param {string} cssClass - CSS classes to apply to component
 * @param {number} delay - Time to wait before starting animation
 * @returns {JSX.Element} - Rendered component
 */

const FadeUp = ({ children, cssClass, delay }: IAnimateWithDelayProps) => {
  const transition: Transition = {
    delay,
    type: 'spring',
    duration: 0.5,
    stiffness: 110,
  };

  const fadeUpVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      y: 0,
      opacity: 1,
      transition,
    },
  };

  return (
    <motion.div
      className={cssClass}
      variants={fadeUpVariants}
      initial="initial"
      animate="animate"
      data-testid="fadeup"
    >
      {children}
    </motion.div>
  );
};

export default FadeUp;

// CircleCI doesn't like import { motion } from "framer-motion" here, so we use require
const { motion } = require('framer-motion');

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
}) => {
  const FadeLeftToRightVariants = {
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: staggerDelay ? staggerDelay : 0.5,
        delay,
        ease: 'easeInOut',
        staggerDirection: 1,
      },
    },
    hidden: {
      opacity: 0,
      transition: {
        when: 'afterChildren',
        staggerChildren: staggerDelay ? staggerDelay : 0.5,
        staggerDirection: -1,
      },
    },
  };
  return (
    <motion.div
      initial="hidden"
      animate={animateNotReverse ? 'visible' : 'hidden'}
      variants={FadeLeftToRightVariants}
      className={cssClass}
      data-testid="fadelefttoright"
    >
      {children}
    </motion.div>
  );
};

export default FadeLeftToRight;

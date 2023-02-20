// CircleCI doesn't like import { motion } from "framer-motion" here, so we use require
const { motion } = require('framer-motion');

/**
 * Fade content left to right. Needs to be used with FadeLeftToRight as parent container
 * @function FadeLeftToRightItem
 * @param {ReactNode} children - Children content to render
 * @param {string} cssClass - CSS classes to apply to component
 * @returns {JSX.Element} - Rendered component
 */

const FadeLeftToRightItem = ({ children, cssClass }: any) => {
  const FadeLeftToRightItemVariants = {
    visible: { opacity: 1, x: 0 },
    hidden: { opacity: 0, x: -20 },
  };
  return (
    <motion.span
      variants={FadeLeftToRightItemVariants}
      className={cssClass}
      data-testid="fadelefttorightitem"
    >
      {children}
    </motion.span>
  );
};

export default FadeLeftToRightItem;

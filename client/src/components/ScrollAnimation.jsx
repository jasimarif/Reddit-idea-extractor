import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export const ScrollAnimation = ({
  children,
  delay = 0.2,
  yOffset = 20,
  duration = 0.6,
  className = '',
  ...props
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : yOffset
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.2, 0.65, 0.3, 0.9]
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ children, delay = 0.1, className = '' }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <ScrollAnimation delay={index * delay}>
          {child}
        </ScrollAnimation>
      ))}
    </div>
  );
};

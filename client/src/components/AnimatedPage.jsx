import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      opacity: {
        duration: 0.35
      },
      scale: {
        duration: 0.5
      }
    }
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const backgroundVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  out: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function AnimatedPage({ children }) {
  const { pathname } = useLocation();
  
  return (
    <>
      {/* Optional: Add a subtle background overlay during transition */}
      <motion.div
        className="fixed inset-0 bg-black/5 dark:bg-white/5 z-0 pointer-events-none"
        variants={backgroundVariants}
        initial="initial"
        animate="in"
        exit="out"
      />
      
      <motion.div
        key={pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className="relative z-10 w-full h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"
      >
        {children}
      </motion.div>
    </>
  );
}

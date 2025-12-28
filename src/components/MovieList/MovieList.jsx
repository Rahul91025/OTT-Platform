import { useSelector } from "react-redux";
import { motion, AnimatePresence, useReducedMotion, useScroll, useTransform } from "framer-motion";
import MovieCard from "../MovieCard/MovieCard";
import Pagination from "../Pagination/Pagination";
import { useMemo, useState, useEffect, useRef } from "react";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: { 
      staggerChildren: 0.02, 
      staggerDirection: -1,
      when: "afterChildren"
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.92,
    rotateX: -15,
    filter: "blur(10px)"
  },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.6,
      delay: custom * 0.03
    },
  }),
  exit: { 
    opacity: 0, 
    scale: 0.85,
    y: -20,
    filter: "blur(8px)",
    transition: { 
      duration: 0.25,
      ease: "easeIn"
    } 
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.15
    }
  }
};

const headerChildVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 40 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 18,
      staggerChildren: 0.12
    }
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 14
    }
  }
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================
const useViewportVisibility = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  return isVisible;
};

const useParallaxScroll = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.8, 0.6, 0.3]);
  
  return { y1, y2, opacity };
};

// ============================================================================
// SKELETON LOADER
// ============================================================================
const SkeletonCard = ({ index, prefersReducedMotion }) => {
  const row = Math.floor(index / 5);
  const col = index % 5;
  const pulseDelay = (row * 0.15) + (col * 0.05);
  
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.88, rotateY: -10 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={prefersReducedMotion ? {} : { 
        delay: pulseDelay,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="relative bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/90 
                 rounded-3xl overflow-hidden aspect-[2/3]
                 border border-gray-800/60 backdrop-blur-sm shadow-2xl
                 transform-gpu perspective-1000"
      style={{ 
        transformStyle: 'preserve-3d',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
      aria-hidden="true"
    >
      {/* Animated shimmer */}
      <motion.div 
        className="absolute inset-0 z-10"
        animate={{
          backgroundPosition: ['200% 0', '-200% 0'],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "linear",
          delay: pulseDelay
        }}
        style={{
          background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0.08) 65%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />
      
      {/* Multi-layer gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-red-900/15 via-purple-900/10 to-blue-900/15"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: pulseDelay }}
      />
      
      {/* Radial gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-radial-gradient"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, delay: pulseDelay + 0.5 }}
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.1), transparent 70%)'
        }}
      />
      
      {/* Content placeholders */}
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-4 z-20">
        <div className="space-y-3">
          <motion.div 
            className="h-5 bg-gradient-to-r from-gray-700/80 via-gray-600/80 to-gray-700/80 rounded-xl w-4/5"
            animate={{ 
              opacity: [0.4, 0.8, 0.4],
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: pulseDelay }}
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div 
            className="h-4 bg-gradient-to-r from-gray-700/60 via-gray-600/60 to-gray-700/60 rounded-xl w-3/5"
            animate={{ 
              opacity: [0.3, 0.7, 0.3],
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: pulseDelay + 0.3 }}
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
        <div className="flex gap-3">
          <motion.div 
            className="h-8 w-16 bg-gray-700/70 rounded-xl border border-gray-600/30"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.02, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: pulseDelay + 0.5 }}
          />
          <motion.div 
            className="h-8 w-20 bg-gray-700/70 rounded-xl border border-gray-600/30"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.02, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: pulseDelay + 0.7 }}
          />
        </div>
      </div>

      {/* Favorite button placeholder */}
      <motion.div
        className="absolute top-4 right-4 w-12 h-12 bg-gray-700/60 rounded-2xl z-20
                   border border-gray-600/40"
        animate={{ 
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.08, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, delay: pulseDelay + 0.2 }}
      />

      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-600/10 to-transparent rounded-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-purple-600/10 to-transparent rounded-3xl" />

      {/* Scan line effect */}
      <motion.div
        className="absolute inset-0 h-40"
        animate={{ y: ['-100%', '300%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: pulseDelay + 1 }}
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.03) 50%, transparent)'
        }}
      />
    </motion.div>
  );
};

// ============================================================================
// SECTION HEADER
// ============================================================================
const SectionHeader = ({ count, loading }) => {
  if (loading) return null;
  
  return (
    <motion.div
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className="mb-10 sm:mb-12 lg:mb-16"
    >
      <div className="flex items-end justify-between flex-wrap gap-6">
        <motion.div variants={headerChildVariants} className="space-y-3">
          <div className="flex items-center gap-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r 
                         from-white via-gray-100 to-gray-300 bg-clip-text text-transparent
                         tracking-tight leading-none">
              Discover Movies
            </h2>
            {count > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                className="px-4 py-2 bg-gradient-to-r from-red-600/25 to-purple-600/25 
                         rounded-2xl border-2 border-red-500/40 backdrop-blur-md
                         shadow-lg shadow-red-500/20"
              >
                <span className="text-white font-bold text-xl sm:text-2xl">{count}</span>
                <span className="text-gray-300 text-sm sm:text-base ml-2 font-medium">
                  {count === 1 ? "Movie" : "Movies"}
                </span>
              </motion.div>
            )}
          </div>
          <p className="text-gray-400 text-base sm:text-lg font-medium">
            Explore our handpicked collection of cinematic masterpieces
          </p>
        </motion.div>
        
        <motion.div 
          variants={headerChildVariants}
          className="flex items-center gap-3"
        >
          {/* Filter button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-gray-800/90 to-gray-900/90 
                     text-white rounded-2xl font-semibold text-sm
                     hover:from-gray-700 hover:to-gray-800 transition-all
                     border border-gray-700/50 backdrop-blur-sm
                     shadow-xl flex items-center gap-2 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" 
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters</span>
          </motion.button>

          {/* Sort button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-red-600/90 to-red-700/90 
                     text-white rounded-2xl font-semibold text-sm
                     hover:from-red-500 hover:to-red-600 transition-all
                     border border-red-500/30 backdrop-blur-sm
                     shadow-xl shadow-red-500/30 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Sort By</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Animated divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent mt-8 origin-left"
      />
    </motion.div>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================
const EmptyState = ({ prefersReducedMotion }) => {
  return (
    <motion.div
      variants={prefersReducedMotion ? {} : emptyStateVariants}
      initial="hidden"
      animate="visible"
      className="col-span-full flex flex-col items-center justify-center 
                 py-24 sm:py-32 lg:py-40 text-center px-6"
      role="status"
      aria-live="polite"
    >
      <motion.div
        variants={childVariants}
        className="relative w-36 h-36 sm:w-48 sm:h-48 mb-12"
      >
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-gray-700/30"
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 90, 0],
            borderColor: ['rgba(75, 85, 99, 0.3)', 'rgba(239, 68, 68, 0.3)', 'rgba(75, 85, 99, 0.3)']
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Middle ring */}
        <motion.div
          className="absolute inset-6 rounded-full bg-gradient-to-br from-gray-800/60 to-gray-900/60 
                   border-2 border-gray-700/40"
          animate={{ 
            scale: [1, 1.08, 1],
            rotate: [0, -45, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-red-600/20 via-purple-600/20 to-blue-600/20 blur-2xl"
          animate={{ 
            opacity: [0.3, 0.7, 0.3],
            scale: [0.9, 1.2, 0.9]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.svg 
            className="w-16 h-16 sm:w-20 sm:h-20 text-gray-500"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ 
              y: [0, -8, 0],
              rotateY: [0, 180, 360]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </motion.svg>
        </div>

        {/* Orbiting particles */}
        {!prefersReducedMotion && [...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-red-500/40 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              marginLeft: '-6px',
              marginTop: '-6px'
            }}
            animate={{
              x: [0, Math.cos(i * 120 * Math.PI / 180) * 80, 0],
              y: [0, Math.sin(i * 120 * Math.PI / 180) * 80, 0],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      <motion.div variants={childVariants} className="space-y-5 max-w-2xl">
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r 
                     from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          No Movies Found
        </h3>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed px-6">
          We couldn't find any movies matching your search criteria.
          <br className="hidden sm:block" />
          Try adjusting your filters or search for something different.
        </p>
      </motion.div>

      <motion.div 
        variants={childVariants}
        className="flex flex-col sm:flex-row gap-4 mt-10"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white 
                   rounded-2xl font-bold text-base flex items-center gap-3
                   hover:from-red-500 hover:to-red-600 transition-all
                   shadow-2xl shadow-red-500/50 border-2 border-red-500/30
                   group"
        >
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          New Search
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gray-800/90 text-white rounded-2xl font-bold text-base
                   hover:bg-gray-700 transition-all border-2 border-gray-700/50
                   shadow-2xl flex items-center gap-3 backdrop-blur-sm group"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} 
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Browse Home
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// ERROR STATE
// ============================================================================
const ErrorState = ({ prefersReducedMotion, onRetry }) => {
  return (
    <motion.div
      variants={prefersReducedMotion ? {} : emptyStateVariants}
      initial="hidden"
      animate="visible"
      className="col-span-full flex flex-col items-center justify-center 
                 py-24 sm:py-32 lg:py-40 text-center px-6"
      role="alert"
    >
      <motion.div variants={childVariants} className="relative w-36 h-36 sm:w-48 sm:h-48 mb-12">
        <motion.div
          className="absolute inset-0 rounded-full bg-red-900/30 border-4 border-red-600/40"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute inset-6 rounded-full bg-gradient-to-br from-red-600/40 to-red-900/40 blur-2xl"
          animate={{ 
            scale: [0.8, 1.3, 0.8],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.svg 
            className="w-20 h-20 sm:w-24 sm:h-24 text-red-500"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ 
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </motion.svg>
        </div>
      </motion.div>

      <motion.div variants={childVariants} className="space-y-5 max-w-2xl">
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
          Oops! Something Went Wrong
        </h3>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed px-6">
          We encountered an error while loading the movies.
          <br className="hidden sm:block" />
          This might be a temporary issue. Please try again.
        </p>
      </motion.div>

      <motion.div variants={childVariants} className="mt-10">
        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white 
                   rounded-2xl font-bold text-lg flex items-center gap-3
                   hover:from-red-500 hover:to-red-600 transition-all
                   shadow-2xl shadow-red-500/50 border-2 border-red-500/30 group"
        >
          <motion.svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </motion.svg>
          <span className="group-hover:tracking-wide transition-all">Retry Loading</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// LOADING INDICATOR
// ============================================================================
const LoadingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: 1, scaleX: 1 }}
    exit={{ opacity: 0, scaleX: 0 }}
    className="fixed top-0 left-0 right-0 z-50 h-1.5 origin-left"
  >
    <motion.div
      className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-blue-600"
      animate={{ 
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      style={{ backgroundSize: '200% 100%' }}
    />
  </motion.div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const MovieList = () => {
  const { movies, loading, error } = useSelector((state) => state.movies);
  const prefersReducedMotion = useReducedMotion();
  const isVisible = useViewportVisibility();
  const listRef = useRef(null);
  const { y1, y2, opacity } = useParallaxScroll();
  
  const hasMovies = movies && movies.length > 0;
  const showPagination = hasMovies && !loading;
  
  // Fixed grid: 3 rows × 5 columns = 15 items per page
  const gridClasses = useMemo(() => 
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 " +
    "gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10",
    []
  );

  const handleRetry = () => {
    window.location.reload();
  };

  // Display exactly 15 movies (3 rows × 5 columns)
  const displayedMovies = useMemo(() => 
    movies?.slice(0, 15) || [],
    [movies]
  );

  return (
    <section 
      ref={listRef}
      className="relative min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24
                 py-8 sm:py-12 lg:py-16"
      aria-label="Movie grid display"
      aria-busy={loading}
    >
      {/* Animated background gradients with parallax */}
      <motion.div 
        className="absolute inset-0 pointer-events-none overflow-hidden -z-10"
        style={{ opacity }}
      >
        <motion.div
          style={{ y: y1 }}
          className="absolute top-0 left-1/4 w-[800px] h-[800px] 
                     bg-gradient-to-br from-red-600/10 via-red-600/5 to-transparent 
                     rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 100, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-0 right-1/4 w-[800px] h-[800px] 
                     bg-gradient-to-tl from-purple-600/10 via-purple-600/5 to-transparent 
                     rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -100, 0]
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-[600px] h-[600px] 
                     bg-gradient-to-r from-blue-600/8 via-transparent to-pink-600/8 
                     rounded-full blur-3xl"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </motion.div>

      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay -z-10">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }} />
      </div>

      {/* Loading progress bar */}
      <AnimatePresence>
        {loading && <LoadingIndicator />}
      </AnimatePresence>

      {/* Screen reader announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {loading && "Loading movies, please wait"}
        {error && "Error loading movies. Please try again"}
        {!loading && !error && hasMovies && `Showing ${displayedMovies.length} movies in a 3 by 5 grid`}
        {!loading && !error && !hasMovies && "No movies found"}
      </div>

      <div className="max-w-[1920px] mx-auto">
        {/* Section header */}
        <SectionHeader count={movies?.length || 0} loading={loading} />

        {/* Main content area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={gridClasses}
            >
              {Array.from({ length: 15 }).map((_, index) => (
                <SkeletonCard 
                  key={`skeleton-${index}`} 
                  index={index}
                  prefersReducedMotion={prefersReducedMotion}
                />
              ))}
            </motion.div>
          ) : error ? (
            <ErrorState 
              key="error" 
              prefersReducedMotion={prefersReducedMotion}
              onRetry={handleRetry}
            />
          ) : !hasMovies ? (
            <EmptyState 
              key="empty" 
              prefersReducedMotion={prefersReducedMotion}
            />
          ) : (
            <motion.div
              key="movies"
              variants={prefersReducedMotion ? {} : containerVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              exit="exit"
              className={gridClasses}
              style={{ perspective: '2000px' }}
            >
              {displayedMovies.map((movie, index) => (
                <motion.div
                  key={movie.imdbID}
                  custom={index}
                  variants={prefersReducedMotion ? {} : itemVariants}
                  style={{ 
                    willChange: index < 10 ? 'transform, opacity' : 'auto',
                    transformStyle: 'preserve-3d'
                  }}
                  whileHover={{ 
                    zIndex: 10,
                  }}
                >
                  <MovieCard
                    movie={movie}
                    index={index}
                    priority={index < 5}
                  />
                </motion.div>
              ))}

              {/* Fill empty slots if less than 15 movies */}
              {displayedMovies.length < 15 && Array.from({ length: 15 - displayedMovies.length }).map((_, index) => (
                <motion.div
                  key={`empty-${index}`}
                  custom={displayedMovies.length + index}
                  variants={prefersReducedMotion ? {} : itemVariants}
                  className="aspect-[2/3] rounded-3xl border-2 border-dashed border-gray-800/40
                           bg-gradient-to-br from-gray-900/30 to-gray-800/30 backdrop-blur-sm
                           flex items-center justify-center group hover:border-gray-700/60
                           transition-all duration-300 cursor-not-allowed"
                >
                  <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M12 4v16m8-8H4" />
                    </svg>
                    <p className="text-gray-600 text-sm font-medium">Empty Slot</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid info badge */}
        {hasMovies && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center justify-center mt-10 gap-6"
          >
            <div className="px-6 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 
                          rounded-2xl border border-gray-700/50 backdrop-blur-md
                          flex items-center gap-3 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-gray-300 text-sm font-medium">
                  Viewing {displayedMovies.length} of {movies.length}
                </span>
              </div>
              <div className="w-px h-6 bg-gray-700/50" />
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                <span>3×5 Grid Layout</span>
              </div>
            </div>

            {/* Quick stats */}
            {movies.length > 15 && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="px-5 py-2.5 bg-red-600/20 rounded-2xl border border-red-500/30 
                         backdrop-blur-md flex items-center gap-2 cursor-pointer
                         hover:bg-red-600/30 transition-all"
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-300 text-sm font-medium">
                  +{movies.length - 15} more movies
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
        
        {/* Pagination */}
        {showPagination && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 sm:mt-20 lg:mt-24"
          >
            <Pagination />
          </motion.div>
        )}
      </div>

      {/* Floating scroll indicator */}
      {hasMovies && !loading && displayedMovies.length === 15 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="px-6 py-3 bg-gray-900/90 backdrop-blur-xl rounded-full
                     border border-gray-700/50 shadow-2xl flex items-center gap-3"
          >
            <span className="text-gray-400 text-sm font-medium">Scroll for more</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default MovieList;
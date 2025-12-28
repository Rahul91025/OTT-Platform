import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { fetchMovies } from "../features/movies/moviesSlice";
import MovieList from "../components/MovieList/MovieList";
import HeroSection from "../components/HeroSection/HeroSection";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const pageVariants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const contentVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -30,
    transition: { duration: 0.4 }
  }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================
const useResponsiveBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLarge: false
  });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setBreakpoint({
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024 && width < 1536,
        isLarge: width >= 1536
      });
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

const useScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  return scrollYProgress;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const Home = () => {
  const dispatch = useDispatch();
  const { search, movies, loading, error } = useSelector((state) => state.movies);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const breakpoint = useResponsiveBreakpoint();
  const scrollProgress = useScrollProgress();

  // Parallax effect for background
  const backgroundY = useTransform(scrollProgress, [0, 1], ['0%', '50%']);

  // Fetch movies on search change
  useEffect(() => {
    dispatch(fetchMovies({ search }));
  }, [dispatch, search]);

  // Enhanced scroll detection with throttling
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setShowScrollTop(window.scrollY > 300);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Memoized search mode check
  const isSearchMode = useMemo(() => 
    search && search.trim().length > 0, 
    [search]
  );

  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative min-h-screen bg-gradient-to-b from-gray-900 via-black to-black overflow-hidden"
    >
      {/* Animated Background Gradient */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-transparent to-purple-950/20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Grain Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay">
        <div className="absolute inset-0 bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px'
        }} />
      </div>

      {/* Navbar spacer - responsive height */}
      <div className="h-14 sm:h-16 md:h-20" />

      {/* Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {isSearchMode ? (
            <SearchResultsView 
              key="search" 
              search={search} 
              movies={movies} 
              loading={loading}
              error={error}
              breakpoint={breakpoint}
            />
          ) : (
            <BrowseView 
              key="browse" 
              movies={movies}
              loading={loading}
              breakpoint={breakpoint}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 
                     p-3 sm:p-4 bg-gradient-to-br from-red-600 to-red-700 text-white 
                     rounded-full shadow-2xl shadow-red-600/40 hover:shadow-red-500/60
                     backdrop-blur-sm border border-red-500/20
                     transition-all duration-300
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400
                     focus-visible:ring-offset-2 focus-visible:ring-offset-black
                     group"
            aria-label="Scroll to top"
          >
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-red-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Loading Progress Bar */}
      {loading && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 origin-left z-50"
        />
      )}
    </motion.main>
  );
};

// ============================================================================
// BROWSE VIEW
// ============================================================================
const BrowseView = ({ movies, loading, breakpoint }) => {
  const featuredMovie = useMemo(() => 
    movies.find(m => m.Poster && m.Poster !== "N/A") || movies[0],
    [movies]
  );

  return (
    <motion.div
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Hero Section */}
      {featuredMovie && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroSection movie={featuredMovie} />
        </motion.div>
      )}

      {/* Main Movie Grid */}
      <motion.section 
        className="relative z-10"
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-6 sm:mb-8">
          <SectionHeader 
            title="Discover Movies" 
            subtitle="Explore our curated collection"
            breakpoint={breakpoint}
          />
        </div>
        <MovieList />
      </motion.section>

      {/* Trending Section */}
      <motion.section 
        className="relative z-10 py-8 sm:py-12 md:py-16"
        variants={fadeInUp}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <SectionHeader 
            title="Trending Now" 
            subtitle="Popular movies this week"
            action="View All"
            breakpoint={breakpoint}
          />
          {/* Trending content would go here */}
        </div>
      </motion.section>
    </motion.div>
  );
};

// ============================================================================
// SEARCH RESULTS VIEW
// ============================================================================
const SearchResultsView = ({ search, movies, loading, error, breakpoint }) => {
  return (
    <motion.div
      variants={contentVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="pt-4 sm:pt-6 md:pt-8"
    >
      {/* Search Header - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-2 sm:space-y-3"
        >
          <p className="text-gray-400 text-xs sm:text-sm font-medium tracking-wide uppercase">
            Search results for
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-red-500 text-3xl sm:text-4xl md:text-5xl">"</span>
            <span className="break-words">{search}</span>
            <span className="text-red-500 text-3xl sm:text-4xl md:text-5xl">"</span>
            {!loading && movies.length > 0 && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm sm:text-base md:text-lg font-normal text-gray-500 whitespace-nowrap"
              >
                ({movies.length} {movies.length === 1 ? 'result' : 'results'})
              </motion.span>
            )}
          </h1>
          
          {/* Search metadata */}
          {!loading && movies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500"
            >
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Updated just now
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                All filters
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Results */}
      <MovieList />
    </motion.div>
  );
};

// ============================================================================
// SECTION HEADER
// ============================================================================
const SectionHeader = ({ title, subtitle, action, breakpoint }) => (
  <motion.div 
    className="flex items-end justify-between mb-4 sm:mb-6"
    variants={fadeInUp}
  >
    <div className="flex-1 min-w-0">
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 truncate">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-400 text-xs sm:text-sm md:text-base">
          {subtitle}
        </p>
      )}
    </div>
    {action && (
      <motion.button
        whileHover={{ x: 5, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex-shrink-0 ml-4 text-red-500 hover:text-red-400 text-xs sm:text-sm font-medium 
                 flex items-center gap-1 sm:gap-1.5 transition-colors
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg
                 px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-red-500/10"
      >
        <span className="hidden sm:inline">{action}</span>
        <span className="sm:hidden">All</span>
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>
    )}
  </motion.div>
);

// ============================================================================
// QUICK FILTERS
// ============================================================================
const QuickFilters = ({ breakpoint }) => {
  const [activeFilter, setActiveFilter] = useState("all");
  
  const filters = [
    { id: "all", label: "All", icon: "🎬", gradient: "from-red-600 to-red-700" },
    { id: "action", label: "Action", icon: "💥", gradient: "from-orange-600 to-red-600" },
    { id: "comedy", label: "Comedy", icon: "😂", gradient: "from-yellow-600 to-orange-600" },
    { id: "drama", label: "Drama", icon: "🎭", gradient: "from-purple-600 to-pink-600" },
    { id: "horror", label: "Horror", icon: "👻", gradient: "from-gray-700 to-gray-900" },
    { id: "scifi", label: "Sci-Fi", icon: "🚀", gradient: "from-blue-600 to-cyan-600" },
    { id: "romance", label: "Romance", icon: "💕", gradient: "from-pink-600 to-rose-600" },
  ];

  // Show fewer filters on mobile
  const visibleFilters = breakpoint.isMobile ? filters.slice(0, 5) : filters;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 sm:pb-4 
                    scrollbar-hide snap-x snap-mandatory scroll-smooth
                    -mx-3 sm:-mx-0 px-3 sm:px-0">
        {visibleFilters.map((filter, index) => (
          <motion.button
            key={filter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.05,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 
                     rounded-full font-medium text-xs sm:text-sm
                     whitespace-nowrap transition-all duration-300 snap-start
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                     focus-visible:ring-offset-2 focus-visible:ring-offset-black
                     ${activeFilter === filter.id
                       ? `bg-gradient-to-r ${filter.gradient} text-white shadow-lg shadow-red-600/30 scale-105`
                       : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white backdrop-blur-md border border-white/10"}`}
          >
            <span className="text-base sm:text-lg">{filter.icon}</span>
            <span>{filter.label}</span>
            
            {/* Active indicator */}
            {activeFilter === filter.id && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
        
        {/* More button on mobile */}
        {breakpoint.isMobile && filters.length > 5 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full font-medium text-xs
                     bg-white/10 text-gray-300 hover:bg-white/20 backdrop-blur-md
                     border border-white/10 whitespace-nowrap snap-start"
          >
            <span>More</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        )}
      </div>
      
      {/* Fade edges for scroll indication */}
      <div className="absolute left-0 top-0 bottom-3 sm:bottom-4 w-8 sm:w-12 
                    bg-gradient-to-r from-black to-transparent pointer-events-none 
                    sm:hidden" />
      <div className="absolute right-0 top-0 bottom-3 sm:bottom-4 w-8 sm:w-12 
                    bg-gradient-to-l from-black to-transparent pointer-events-none 
                    sm:hidden" />
    </div>
  );
};

export default Home;
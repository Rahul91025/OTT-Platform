import { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { openModal, fetchMovieDetails } from "../../features/movies/moviesSlice";
import { toggleFavorite } from "../../features/movies/favoritesSlice";

// Debounce utility for hover detection
const useHoverIntent = (callback, delay = 400) => {
  const timeoutRef = useRef(null);
  
  const trigger = useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);
  
  useEffect(() => () => cancel(), [cancel]);
  
  return { trigger, cancel };
};

// Expanded card with optimized data fetching
const ExpandedCard = memo(({ movie, position, onClose, index }) => {
  const dispatch = useDispatch();
  const prefersReducedMotion = useReducedMotion();
  const favorites = useSelector((state) => state.favorites?.favorites || []);
  const isFavorite = favorites.some((fav) => fav.imdbID === movie.imdbID);
  
  // Use cached details from Redux instead of fetching every time
  const cachedDetails = useSelector((state) => 
    state.movies?.movieDetails?.[movie.imdbID]
  );
  
  const [details, setDetails] = useState(cachedDetails || null);
  const [isLoading, setIsLoading] = useState(!cachedDetails);
  
  useEffect(() => {
    // Only fetch if not cached
    if (!cachedDetails && movie.imdbID) {
      setIsLoading(true);
      dispatch(fetchMovieDetails(movie.imdbID)).then((action) => {
        if (action.payload) {
          setDetails(action.payload);
        }
        setIsLoading(false);
      });
    }
  }, [movie.imdbID, dispatch, cachedDetails]);
  
  const movieData = details ? { ...movie, ...details } : movie;
  
  const handlePlay = (e) => {
    e.stopPropagation();
    console.log(`[Analytics] Play initiated: ${movie.Title}`);
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    dispatch(toggleFavorite(movie));
  };

  const handleMoreInfo = (e) => {
    e.stopPropagation();
    dispatch(openModal(movieData));
    onClose();
  };

  const getRatingDisplay = (rating) => {
    const score = parseFloat(rating);
    if (isNaN(score)) return null;
    return {
      value: rating,
      color: score >= 8 ? "text-green-400" : score >= 6 ? "text-amber-400" : "text-orange-400"
    };
  };

  const rating = getRatingDisplay(movieData.imdbRating);
  
  // Calculate positioning based on card index
  const getPositionClasses = () => {
    if (position === "first") return "left-0";
    if (position === "last") return "right-0";
    return "left-1/2 -translate-x-1/2";
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 5 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 32,
        mass: 0.8
      }}
      className={`absolute z-50 w-[320px] sm:w-[360px] bg-gray-900 rounded-lg overflow-hidden 
                 shadow-2xl shadow-black/60 border border-white/10 -top-12
                 ${getPositionClasses()}`}
      onMouseLeave={onClose}
      role="dialog"
      aria-label={`Details for ${movie.Title}`}
    >
      {/* Poster/Preview */}
      <div className="relative aspect-video overflow-hidden bg-gray-800">
        {isLoading ? (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <img
              src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder-poster.jpg"}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/30 to-transparent" />
          </>
        )}
        
        {/* Quality badge */}
        {movieData.imdbRating && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm 
                          text-white text-xs font-semibold rounded">
              <span className="text-amber-400">★</span>
              <span>{movieData.imdbRating}</span>
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Primary action row - Clear hierarchy */}
        <div className="flex items-center gap-2">
          {/* Primary CTA */}
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.96 }}
            onClick={handlePlay}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md
                     bg-white text-gray-900 hover:bg-gray-100 transition-colors
                     font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 
                     focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label={`Play ${movie.Title}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play</span>
          </motion.button>
          
          {/* Secondary actions */}
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            onClick={handleFavorite}
            className={`w-9 h-9 flex items-center justify-center rounded-md
                     border-2 transition-all focus-visible:outline-none focus-visible:ring-2 
                     focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900
                     ${isFavorite 
                       ? "bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700" 
                       : "bg-gray-800 border-gray-700 text-white hover:border-gray-600"}`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </motion.button>
          
          <motion.button
            whileHover={prefersReducedMotion ? {} : { scale: 1.08 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            onClick={handleMoreInfo}
            className="w-9 h-9 flex items-center justify-center rounded-md
                     bg-gray-800 border-2 border-gray-700 text-white
                     hover:border-gray-600 transition-all
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white 
                     focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900"
            aria-label={`More information about ${movie.Title}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.button>
        </div>
        
        {/* Metadata row */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {movieData.Year && (
            <span className="text-gray-400 font-medium">{movieData.Year}</span>
          )}
          {movieData.Rated && movieData.Rated !== "N/A" && (
            <>
              <span className="w-1 h-1 bg-gray-600 rounded-full" aria-hidden="true" />
              <span className="px-1.5 py-0.5 border border-gray-700 text-gray-400 rounded">
                {movieData.Rated}
              </span>
            </>
          )}
          {movieData.Runtime && movieData.Runtime !== "N/A" && (
            <>
              <span className="w-1 h-1 bg-gray-600 rounded-full" aria-hidden="true" />
              <span className="text-gray-400">{movieData.Runtime}</span>
            </>
          )}
        </div>
        
        {/* Genres */}
        {movieData.Genre && movieData.Genre !== "N/A" && (
          <div className="flex flex-wrap gap-1.5">
            {movieData.Genre.split(",").slice(0, 3).map((genre) => (
              <span 
                key={genre.trim()} 
                className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded-full"
              >
                {genre.trim()}
              </span>
            ))}
          </div>
        )}
        
        {/* Plot preview */}
        {movieData.Plot && movieData.Plot !== "N/A" && (
          <p 
            className="text-sm text-gray-400 leading-relaxed"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {movieData.Plot}
          </p>
        )}
      </div>
    </motion.div>
  );
});

ExpandedCard.displayName = "ExpandedCard";

// Optimized card component with GPU-accelerated animations
const RowCard = memo(({ movie, index, totalCards, onHover, onLeave, showRanking }) => {
  const prefersReducedMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef(null);
  
  const getPosition = () => {
    if (index === 0) return "first";
    if (index === totalCards - 1) return "last";
    return "middle";
  };

  const { trigger: triggerHover, cancel: cancelHover } = useHoverIntent(
    () => onHover(movie, getPosition(), index),
    400 // Optimized hover delay
  );

  const handleClick = () => {
    console.log(`[Analytics] Card clicked: ${movie.Title}`);
    onHover(movie, getPosition(), index);
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative flex-shrink-0"
      style={{ scrollSnapAlign: "start" }}
      onMouseEnter={triggerHover}
      onMouseLeave={() => {
        cancelHover();
        onLeave();
      }}
      onClick={handleClick}
    >
      <motion.div
        whileHover={prefersReducedMotion ? {} : { scale: 1.05, zIndex: 10 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="relative w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] aspect-[2/3] 
                 rounded-lg overflow-hidden cursor-pointer bg-gray-800 group
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50
                 transition-shadow duration-300"
        tabIndex={0}
        role="button"
        aria-label={`${movie.Title}, ${movie.Year}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Loading skeleton - GPU accelerated */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-800">
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                animation: 'shimmer 2s infinite',
              }}
            />
          </div>
        )}
        
        {/* Image */}
        {!imageError ? (
          <img
            src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder-poster.jpg"}
            alt=""
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-all duration-500
                      ${imageLoaded ? "opacity-100" : "opacity-0"}
                      group-hover:scale-105`}
            style={{ willChange: imageLoaded ? 'auto' : 'opacity' }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
             aria-hidden="true" />
        
        {/* Title info - appears on hover */}
        <motion.div
          initial={false}
          className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-2 opacity-0 
                   group-hover:translate-y-0 group-hover:opacity-100
                   transition-all duration-300"
        >
          <h3 className="text-white font-bold text-xs leading-tight mb-1"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
            {movie.Title}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
            <span>{movie.Year}</span>
            {movie.Type && (
              <>
                <span className="w-0.5 h-0.5 bg-gray-500 rounded-full" aria-hidden="true" />
                <span className="capitalize">{movie.Type}</span>
              </>
            )}
          </div>
        </motion.div>
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300"
             aria-hidden="true">
          <motion.div
            whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
            className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center 
                     justify-center shadow-lg shadow-black/40"
          >
            <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </motion.div>
        </div>
        
        {/* NEW badge for first 3 items */}
        {index < 3 && (
          <div className="absolute top-2 right-2">
            <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded uppercase tracking-wide">
              New
            </span>
          </div>
        )}
      </motion.div>
      
      {/* Ranking number overlay */}
      {showRanking && index < 10 && (
        <div className="absolute -left-3 sm:-left-4 bottom-0 z-0 pointer-events-none select-none"
             aria-hidden="true">
          <span 
            className="block text-6xl sm:text-7xl md:text-8xl font-black leading-none"
            style={{ 
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,255,255,0.1)',
              textShadow: '3px 3px 6px rgba(0,0,0,0.8)',
            }}
          >
            {index + 1}
          </span>
        </div>
      )}
    </motion.div>
  );
});

RowCard.displayName = "RowCard";

// Scroll button with better visibility
const ScrollButton = memo(({ direction, onClick, visible, prefersReducedMotion }) => (
  <AnimatePresence>
    {visible && (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClick}
        className={`absolute ${direction === "left" ? "left-0" : "right-0"} top-0 bottom-0 z-30 
                   w-10 sm:w-12 md:w-14 flex items-center 
                   ${direction === "left" ? "justify-start pl-1 sm:pl-2" : "justify-end pr-1 sm:pr-2"}
                   focus-visible:outline-none`}
        style={{
          background: direction === "left" 
            ? "linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)"
            : "linear-gradient(to left, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)",
        }}
        aria-label={`Scroll ${direction}`}
      >
        <motion.div
          whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20
                   hover:bg-white/20 hover:border-white/40 transition-all
                   focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg 
            className="w-4 h-4 sm:w-5 sm:h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d={direction === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} 
            />
          </svg>
        </motion.div>
      </motion.button>
    )}
  </AnimatePresence>
));

ScrollButton.displayName = "ScrollButton";

// Progress indicator
const RowProgress = memo(({ progress, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-800/50"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-red-600 to-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </motion.div>
    )}
  </AnimatePresence>
));

RowProgress.displayName = "RowProgress";

// Main CategoryRow component
const CategoryRow = ({ 
  title, 
  movies, 
  onSeeAll, 
  icon,
  showRanking = false,
  accentColor = "red" 
}) => {
  const prefersReducedMotion = useReducedMotion();
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isRowHovered, setIsRowHovered] = useState(false);

  // Optimized scroll detection with debouncing
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < maxScroll - 10);
      setScrollProgress(maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0);
    }
  }, []);

  // Initialize and handle resize
  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [checkScroll, movies]);

  // Improved scroll function with better UX
  const scroll = useCallback((direction) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const cardWidth = 200; // Base card width
      const gap = 16;
      const viewportWidth = container.clientWidth;
      const cardsVisible = Math.floor(viewportWidth / (cardWidth + gap));
      const scrollAmount = (cardWidth + gap) * Math.max(cardsVisible - 1, 2);
      
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' && canScrollLeft) {
      e.preventDefault();
      scroll('left');
    } else if (e.key === 'ArrowRight' && canScrollRight) {
      e.preventDefault();
      scroll('right');
    }
  }, [canScrollLeft, canScrollRight, scroll]);

  const handleCardHover = useCallback((movie, position, index) => {
    setHoveredCard({ movie, position, index });
  }, []);

  const handleCardLeave = useCallback(() => {
    setHoveredCard(null);
  }, []);

  if (!movies || movies.length === 0) return null;

  return (
    <section 
      ref={containerRef}
      className="relative py-4 sm:py-6 md:py-8 group/section"
      onMouseEnter={() => setIsRowHovered(true)}
      onMouseLeave={() => {
        setIsRowHovered(false);
        setHoveredCard(null);
      }}
      onKeyDown={handleKeyDown}
      aria-label={`${title} section`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-12 mb-3 sm:mb-4 md:mb-5">
        <div className="flex items-center gap-2 sm:gap-3">
          {icon && (
            <span className="text-xl sm:text-2xl" aria-hidden="true">{icon}</span>
          )}
          
          <motion.h2
            initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white 
                     cursor-pointer group/title relative"
            onClick={onSeeAll}
          >
            {title}
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-red-500
                         group-hover/title:w-full transition-all duration-300" 
                  aria-hidden="true" />
          </motion.h2>
          
          {/* Explore indicator */}
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: isRowHovered ? 1 : 0, x: isRowHovered ? 0 : -5 }}
            className="hidden sm:flex items-center gap-1 text-xs md:text-sm text-red-500 font-medium"
          >
            Explore
            <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.span>
        </div>

        {/* Title count */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: isRowHovered ? 1 : 0.7 }}
          className="hidden md:block text-gray-500 text-sm"
        >
          {movies.length} {movies.length === 1 ? 'title' : 'titles'}
        </motion.span>
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Scroll buttons */}
        <ScrollButton 
          direction="left" 
          onClick={() => scroll("left")} 
          visible={canScrollLeft && isRowHovered}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Movies grid */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide 
                   px-4 sm:px-6 lg:px-12 pb-3 pt-1"
          style={{ 
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: "1rem",
          }}
          role="list"
        >
          {movies.map((movie, index) => (
            <div key={movie.imdbID} role="listitem">
              <RowCard
                movie={movie}
                index={index}
                totalCards={movies.length}
                onHover={handleCardHover}
                onLeave={handleCardLeave}
                showRanking={showRanking}
              />
            </div>
          ))}
          
          {/* See all card */}
          {onSeeAll && (
            <motion.button
              onClick={onSeeAll}
              whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] aspect-[2/3]
                       rounded-lg bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm
                       border border-white/10 hover:border-white/30
                       flex flex-col items-center justify-center gap-3
                       transition-all duration-300 group/seeall
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              style={{ scrollSnapAlign: "start" }}
              aria-label={`See all ${title}`}
            >
              <div className="w-12 h-12 rounded-full bg-red-600/20 
                            flex items-center justify-center
                            group-hover/seeall:bg-red-600/40 transition-colors">
                <svg 
                  className="w-6 h-6 text-red-500"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold text-sm mb-0.5">See All</div>
                <div className="text-gray-500 text-xs">{movies.length}+ titles</div>
              </div>
            </motion.button>
          )}
        </div>

        <ScrollButton 
          direction="right" 
          onClick={() => scroll("right")} 
          visible={canScrollRight && isRowHovered}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Expanded card portal */}
        <AnimatePresence mode="wait">
          {hoveredCard && (
            <div 
              className="absolute top-0 left-0 right-0 z-40 pointer-events-none 
                       px-4 sm:px-6 lg:px-12"
              style={{
                transform: `translateX(${hoveredCard.index * (200 + 16)}px)`,
                transition: 'transform 0.3s ease-out'
              }}
            >
              <div className="pointer-events-auto max-w-[360px]">
                <ExpandedCard
                  movie={hoveredCard.movie}
                  position={hoveredCard.position}
                  onClose={handleCardLeave}
                  index={hoveredCard.index}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <RowProgress progress={scrollProgress} visible={isRowHovered} />
      </div>
      
      {/* Add shimmer keyframes to page */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
};

export default memo(CategoryRow)
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { openModal, fetchMovieDetails } from "../../features/movies/moviesSlice";
import { toggleFavorite } from "../../features/movies/favoritesSlice";
import { useState, useEffect, useCallback, memo, useRef } from "react";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  animate: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.05,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }),
  hover: {
    scale: 1.05,
    zIndex: 50,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const expandedContentVariants = {
  collapsed: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  },
  expanded: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.05
    }
  }
};

const childVariants = {
  collapsed: { opacity: 0, y: 10 },
  expanded: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const glowVariants = {
  idle: {
    opacity: 0,
    scale: 0.8
  },
  active: {
    opacity: [0, 0.6, 0],
    scale: [0.8, 1.2, 1.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const getRatingColor = (rating) => {
  const score = parseFloat(rating);
  if (score >= 8) return { text: "text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" };
  if (score >= 6) return { text: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" };
  return { text: "text-rose-400", bg: "bg-rose-500/20", border: "border-rose-500/30" };
};

const getRatingIcon = (rating) => {
  const score = parseFloat(rating);
  if (score >= 8) return "🔥";
  if (score >= 6) return "⭐";
  return "💫";
};

const formatRuntime = (runtime) => {
  if (!runtime || runtime === "N/A") return null;
  const match = runtime.match(/\d+/);
  if (!match) return runtime;
  const mins = parseInt(match[0]);
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const MovieCard = memo(({ movie, index }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);
  const isFavorite = favorites.some((fav) => fav.imdbID === movie.imdbID);
  const [details, setDetails] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showFullInfo, setShowFullInfo] = useState(false);
  const cardRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  // 3D tilt effect with smoother physics
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [12, -12]), { 
    stiffness: 400, 
    damping: 35,
    mass: 0.5
  });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-12, 12]), { 
    stiffness: 400, 
    damping: 35,
    mass: 0.5
  });



  // Prefetch details on hover
  useEffect(() => {
    if (isHovered && !details && !movie.Plot && movie.imdbID) {
      dispatch(fetchMovieDetails(movie.imdbID)).then((action) => {
        if (action.payload) {
          setDetails(action.payload);
        }
      });
    }
  }, [isHovered, movie.imdbID, dispatch, movie.Plot, details]);

  // Show full info after hover delay
  useEffect(() => {
    if (isHovered) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowFullInfo(true);
      }, 300);
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      // Use setTimeout to avoid synchronous state update
      setTimeout(() => setShowFullInfo(false), 0);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [isHovered]);

  const movieData = details ? { ...movie, ...details } : movie;

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  }, [x, y]);

  const handleCardClick = useCallback(() => {
    dispatch(openModal(movie));
  }, [dispatch, movie]);

  const handleFavoriteClick = useCallback((e) => {
    e.stopPropagation();
    dispatch(toggleFavorite(movie));
  }, [dispatch, movie]);

  const handlePlayClick = useCallback((e) => {
    e.stopPropagation();
    alert(`Playing ${movie.Title}`);
  }, [movie.Title]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  }, [handleCardClick]);

  const ratingColors = movieData.imdbRating ? getRatingColor(movieData.imdbRating) : null;
  const runtime = formatRuntime(movieData.Runtime);

  return (
    <motion.article
      ref={cardRef}
      custom={index}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      style={{ 
        rotateX, 
        rotateY, 
        transformStyle: "preserve-3d",
        transformPerspective: 1000
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${movie.Title} (${movie.Year}). Press Enter for details.`}
      className="relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 
                 focus-visible:ring-red-500 focus-visible:ring-offset-2 
                 focus-visible:ring-offset-black group"
    >
      {/* Animated Glow Effect */}
      <motion.div
        variants={glowVariants}
        animate={isHovered ? "active" : "idle"}
        className="absolute -inset-4 bg-gradient-to-r from-red-500/30 via-purple-500/30 to-blue-500/30 
                   rounded-3xl blur-2xl -z-10"
        style={{ transform: "translateZ(-20px)" }}
      />

      {/* Main Card Container */}
      <motion.div
        layout
        className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 
                   rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm
                   border border-gray-800/50 hover:border-gray-700/50 transition-colors"
        style={{
          boxShadow: isHovered 
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(239, 68, 68, 0.3)"
            : "0 10px 30px -15px rgba(0, 0, 0, 0.6)"
        }}
      >
        {/* Image Container */}
        <div className="relative aspect-[2/3] overflow-hidden">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent 
                           animate-shimmer" />
            </div>
          )}

          {/* Movie Poster */}
          <motion.img
            src={movie.Poster !== "N/A" ? movie.Poster : "/placeholder-poster.jpg"}
            alt={`${movie.Title} poster`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700
                       ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            style={{
              transform: isHovered ? "scale(1.1)" : "scale(1)",
              filter: isHovered ? "brightness(0.4) saturate(1.2)" : "brightness(1)"
            }}
          />

          {/* Top Gradient Overlay */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent" />
          
          {/* Bottom Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent" />

          {/* Scan Line Effect on Hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ y: "-100%" }}
                animate={{ y: "100%" }}
                exit={{ y: "100%" }}
                transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-white/10 to-transparent 
                         pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Favorite Button */}
        <motion.button
          onClick={handleFavoriteClick}
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-xl z-30
                     transition-all duration-300 focus-visible:outline-none 
                     focus-visible:ring-2 focus-visible:ring-white shadow-lg
                     ${isFavorite 
                       ? "bg-red-500/90 text-white shadow-red-500/50 border border-red-400/50" 
                       : "bg-black/60 text-white/80 hover:bg-black/80 hover:text-white border border-white/10"}`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          style={{ transform: "translateZ(30px)" }}
        >
          <motion.svg
            className="w-5 h-5"
            fill={isFavorite ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
            initial={false}
            animate={isFavorite ? { 
              scale: [1, 1.4, 1],
              rotate: [0, 10, -10, 0]
            } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </motion.svg>
        </motion.button>

        {/* Quality Badge */}
        {movieData.imdbRating && movieData.imdbRating !== "N/A" && parseFloat(movieData.imdbRating) >= 8 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
            className="absolute top-3 left-3 px-3 py-1.5 rounded-lg backdrop-blur-xl
                     bg-gradient-to-r from-amber-500/90 to-orange-500/90 
                     text-white text-xs font-bold shadow-lg border border-amber-400/50 z-30
                     flex items-center gap-1"
            style={{ transform: "translateZ(30px)" }}
          >
            <span className="text-sm">👑</span>
            <span>TOP RATED</span>
          </motion.div>
        )}

        {/* Basic Info Overlay - Always Visible */}
        <motion.div
          className="absolute bottom-0 inset-x-0 p-3 sm:p-4 md:p-5 z-20"
          style={{ transform: "translateZ(20px)" }}
        >
          {/* Title */}
          <motion.h2
            className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight mb-1.5 sm:mb-2 line-clamp-2
                     drop-shadow-lg"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}
          >
            {movie.Title}
          </motion.h2>

          {/* Meta Info Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3 flex-wrap">
            {/* Year */}
            <span className="px-1.5 sm:px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-md border border-white/20 text-xs sm:text-sm">
              {movie.Year}
            </span>

            {/* Rating */}
            {movieData.imdbRating && movieData.imdbRating !== "N/A" && ratingColors && (
              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 ${ratingColors.bg}
                             backdrop-blur-sm rounded-md border ${ratingColors.border}`}>
                <span className="text-xs sm:text-sm">{getRatingIcon(movieData.imdbRating)}</span>
                <span className={`font-bold ${ratingColors.text} text-xs sm:text-sm`}>
                  {movieData.imdbRating}
                </span>
              </div>
            )}

            {/* Runtime */}
            {runtime && (
              <>
                <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gray-500" />
                <span className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {runtime}
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Expanded Info Panel - Shown on Hover */}
        <AnimatePresence>
          {showFullInfo && (
            <motion.div
              variants={expandedContentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="absolute inset-0 bg-gradient-to-t from-black via-black/95 to-black/80 
                       backdrop-blur-md z-20 flex flex-col p-5"
              style={{ transform: "translateZ(25px)" }}
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {/* Title & Year */}
                <motion.div variants={childVariants} className="space-y-2">
                  <h3 className="text-white font-bold text-xl leading-tight">
                    {movie.Title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-400 text-sm">{movie.Year}</span>
                    {movieData.Rated && movieData.Rated !== "N/A" && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span className="px-2 py-0.5 bg-gray-700/50 text-gray-300 text-xs rounded border border-gray-600">
                          {movieData.Rated}
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Rating Section */}
                {movieData.imdbRating && movieData.imdbRating !== "N/A" && ratingColors && (
                  <motion.div variants={childVariants} 
                    className={`p-3 rounded-xl ${ratingColors.bg} border ${ratingColors.border}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getRatingIcon(movieData.imdbRating)}</span>
                        <div>
                          <div className={`text-2xl font-bold ${ratingColors.text}`}>
                            {movieData.imdbRating}
                          </div>
                          <div className="text-xs text-gray-400">IMDb Rating</div>
                        </div>
                      </div>
                      {movieData.imdbVotes && movieData.imdbVotes !== "N/A" && (
                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">
                            {movieData.imdbVotes}
                          </div>
                          <div className="text-xs text-gray-400">votes</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Genre Tags */}
                {movieData.Genre && movieData.Genre !== "N/A" && (
                  <motion.div variants={childVariants} className="space-y-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Genres
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {movieData.Genre.split(", ").map((genre, idx) => (
                        <motion.span
                          key={genre}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-red-600/20 to-purple-600/20
                                   backdrop-blur-sm text-gray-200 rounded-full border border-red-500/30
                                   hover:border-red-500/50 hover:bg-red-600/30 transition-all cursor-default"
                        >
                          {genre}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Plot */}
                {movieData.Plot && movieData.Plot !== "N/A" && (
                  <motion.div variants={childVariants} className="space-y-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Plot
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {movieData.Plot}
                    </p>
                  </motion.div>
                )}

                {/* Director & Cast */}
                <motion.div variants={childVariants} className="grid grid-cols-1 gap-3">
                  {movieData.Director && movieData.Director !== "N/A" && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        Director
                      </div>
                      <div className="text-sm text-white">{movieData.Director}</div>
                    </div>
                  )}

                  {movieData.Actors && movieData.Actors !== "N/A" && (
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Cast
                      </div>
                      <div className="text-sm text-gray-300">{movieData.Actors}</div>
                    </div>
                  )}
                </motion.div>

                {/* Awards */}
                {movieData.Awards && movieData.Awards !== "N/A" && movieData.Awards !== "N/A" && (
                  <motion.div variants={childVariants} 
                    className="p-3 bg-gradient-to-r from-amber-600/10 to-yellow-600/10 rounded-xl border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <span className="text-xl mt-0.5">🏆</span>
                      <div>
                        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                          Awards
                        </div>
                        <div className="text-sm text-gray-300">{movieData.Awards}</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <motion.div 
                variants={childVariants}
                className="flex gap-2 pt-4 border-t border-gray-800"
              >
                <motion.button
                  onClick={handlePlayClick}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 
                           bg-gradient-to-r from-red-600 to-red-700 text-white 
                           px-4 py-3 rounded-xl font-bold text-sm
                           hover:from-red-500 hover:to-red-600 transition-all
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400
                           shadow-lg hover:shadow-red-500/50"
                  aria-label={`Play ${movie.Title}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Watch Now</span>
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(openModal(movie));
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-gray-800/80 backdrop-blur-sm text-white rounded-xl
                           hover:bg-gray-700 transition-all border border-gray-700
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                  aria-label="More information"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.article>
  );
});

MovieCard.displayName = "MovieCard";

export default MovieCard;
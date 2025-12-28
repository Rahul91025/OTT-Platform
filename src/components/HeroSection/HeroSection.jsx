import { motion, useReducedMotion } from "framer-motion";
import { useDispatch } from "react-redux";
import { openModal } from "../../features/movies/moviesSlice";
import { useState, useEffect, useMemo, memo } from "react";

// Optimized particle component with device detection
const AnimatedParticle = memo(({ index, shouldAnimate }) => {
  const initialX = useMemo(() => Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920), []);
  const initialY = useMemo(() => Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080), []);
  const scale = useMemo(() => Math.random() * 0.5 + 0.5, []);
  const duration = useMemo(() => Math.random() * 10 + 15, []);
  const delay = useMemo(() => Math.random() * 5, []);

  if (!shouldAnimate) return null;

  return (
    <motion.div
      className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/8 rounded-full blur-sm"
      initial={{
        x: initialX,
        y: initialY,
        scale,
        opacity: 0,
      }}
      animate={{
        y: [null, -120],
        opacity: [0, 0.25, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
    />
  );
});

AnimatedParticle.displayName = "AnimatedParticle";

const HeroSection = ({ movie }) => {
  const dispatch = useDispatch();
  const prefersReducedMotion = useReducedMotion();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // Device and orientation detection
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      const landscape = window.innerHeight < window.innerWidth && window.innerHeight < 600;
      setIsMobile(mobile);
      setIsLandscape(landscape);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Reset state when movie changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [movie?.imdbID]);

  if (!movie) {
    return (
      <section 
        className="relative flex items-center justify-center bg-gray-950
                   h-[60vh] sm:h-[70vh] md:h-[80vh] landscape:h-screen"
        role="status"
        aria-label="Loading featured content"
      >
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gray-700 border-t-red-600 rounded-full animate-spin mx-auto mb-3" />
          <div className="text-gray-500 text-base sm:text-lg">Loading featured content...</div>
        </div>
      </section>
    );
  }

  const handleMoreInfo = () => {
    console.log(`[Analytics] More Info clicked: ${movie.Title}`);
    dispatch(openModal(movie));
  };

  const handlePlay = () => {
    console.log(`[Analytics] Play initiated: ${movie.Title}`);
    alert(`Playing ${movie.Title}`);
  };

  const posterSrc = movie.Poster !== "N/A" ? movie.Poster : null;
  const hasValidRating = movie.imdbRating && movie.imdbRating !== "N/A";
  const primaryGenre = movie.Genre?.split(",")[0]?.trim() || movie.Type;

  // Adaptive particle count based on device
  const particleCount = prefersReducedMotion ? 0 : isMobile ? 4 : 8;
  const shouldShowParticles = !prefersReducedMotion && imageLoaded && !isMobile;

  return (
    <section 
      className="relative overflow-hidden bg-gray-950
                 h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[85vh] xl:h-[90vh]
                 landscape:h-screen landscape:min-h-[500px]"
      role="banner"
      aria-label="Featured movie"
    >
      {/* Background Image Layer with responsive object positioning */}
      <div className="absolute inset-0" aria-hidden="true">
        {posterSrc && !imageError ? (
          <>
            <picture>
              {/* WebP format for modern browsers - better compression */}
              <source
                type="image/webp"
                srcSet={posterSrc}
              />
              <img
                src={posterSrc}
                alt=""
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  console.warn(`[HeroSection] Failed to load poster for ${movie.Title}`);
                }}
                className={`w-full h-full object-cover transition-opacity duration-700
                          ${imageLoaded ? "opacity-100" : "opacity-0"}
                          object-center sm:object-[center_20%]`}
                loading="eager"
                fetchpriority="high"
              />
            </picture>
            
            {/* Responsive gradient system - tighter on mobile for readability */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(to right, 
                    rgb(0 0 0 / 0.98) 0%, 
                    rgb(0 0 0 / 0.85) 30%, 
                    rgb(0 0 0 / 0.6) 50%,
                    transparent 70%),
                  linear-gradient(to top, 
                    rgb(0 0 0 / 1) 0%, 
                    rgb(0 0 0 / 0.3) 40%,
                    transparent 60%, 
                    rgb(0 0 0 / 0.4) 100%)
                `
              }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.15),transparent_50%)]" />
          </div>
        )}
        
        {/* Skeleton loader */}
        {!imageLoaded && !imageError && posterSrc && (
          <div className="absolute inset-0 bg-gray-900">
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                animation: 'shimmer 2s infinite linear',
              }}
            />
          </div>
        )}
      </div>

      {/* Content Container - Responsive padding and safe zones */}
      <div className="relative z-10 h-full">
        <div className="h-full max-w-[1920px] mx-auto 
                      px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20
                      pt-20 sm:pt-24 md:pt-0
                      flex items-center landscape:pt-20">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl lg:max-w-2xl xl:max-w-3xl
                     landscape:max-w-lg"
          >
            {/* Metadata Row - Compact on mobile */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-2 sm:gap-2.5 md:gap-3 mb-2 sm:mb-3 flex-wrap"
            >
              <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 
                            bg-red-600/90 backdrop-blur-sm text-white 
                            text-[10px] sm:text-xs font-semibold rounded tracking-wide">
                Featured
              </span>
              {movie.Year && (
                <>
                  <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-500 rounded-full" aria-hidden="true" />
                  <span className="text-gray-400 text-xs sm:text-sm font-medium">
                    {movie.Year}
                  </span>
                </>
              )}
              {hasValidRating && (
                <>
                  <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-gray-500 rounded-full" aria-hidden="true" />
                  <span className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm">
                    <span className="text-amber-400" aria-hidden="true">★</span>
                    <span className="text-white font-semibold">{movie.imdbRating}</span>
                    <span className="text-gray-400 text-[10px] sm:text-xs">/10</span>
                  </span>
                </>
              )}
            </motion.div>

            {/* Title - Fluid typography with clamp() for precise control */}
            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-white mb-3 sm:mb-4 md:mb-5 leading-[1.1] tracking-tight font-black"
              style={{
                fontSize: 'clamp(1.75rem, 5vw + 0.5rem, 4.5rem)', // 28px → 72px fluid
                lineHeight: '1.1',
              }}
            >
              {movie.Title}
            </motion.h1>

            {/* Secondary metadata - Hidden in landscape mobile */}
            {(movie.Runtime || primaryGenre) && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="hidden landscape:hidden sm:flex items-center gap-2 sm:gap-3 
                         text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 md:mb-5"
              >
                {movie.Runtime && movie.Runtime !== "N/A" && (
                  <span className="font-medium">{movie.Runtime}</span>
                )}
                {movie.Runtime && primaryGenre && (
                  <span className="w-1 h-1 bg-gray-600 rounded-full" aria-hidden="true" />
                )}
                {primaryGenre && (
                  <span className="font-medium">{primaryGenre}</span>
                )}
              </motion.div>
            )}

            {/* Description - Responsive line clamping */}
            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-gray-200 leading-relaxed mb-5 sm:mb-6 md:mb-8
                       max-w-xl lg:max-w-2xl
                       hidden landscape:hidden xs:block"
              style={{
                fontSize: 'clamp(0.875rem, 1.5vw + 0.5rem, 1.125rem)', // 14px → 18px fluid
                display: '-webkit-box',
                WebkitLineClamp: isMobile ? 2 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {movie.Plot && movie.Plot !== "N/A" 
                ? movie.Plot 
                : "An exceptional cinematic experience awaits. Discover compelling storytelling, memorable performances, and stunning visuals."}
            </motion.p>

            {/* CTA Buttons - Touch-friendly on mobile */}
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-2 sm:gap-3 flex-wrap"
            >
              {/* Primary CTA - 48px touch target on mobile */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                onClick={handlePlay}
                className="group flex items-center justify-center gap-2 sm:gap-3 
                         bg-white text-gray-900 rounded-md
                         font-bold transition-all duration-200
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white 
                         focus-visible:ring-offset-2 focus-visible:ring-offset-black
                         shadow-lg shadow-black/40
                         px-5 py-3 text-sm sm:px-6 sm:py-3.5 sm:text-base md:px-7 md:py-4 md:text-base
                         min-h-[48px] sm:min-h-[44px]
                         hover:bg-gray-100"
                aria-label={`Play ${movie.Title}`}
              >
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play</span>
              </motion.button>

              {/* Secondary CTA - Touch-friendly */}
              <motion.button
                whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                onClick={handleMoreInfo}
                className="group flex items-center justify-center gap-2 sm:gap-2.5 
                         bg-white/10 backdrop-blur-md text-white rounded-md
                         font-semibold transition-all duration-200
                         hover:bg-white/20 border border-white/20 hover:border-white/30
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                         focus-visible:ring-offset-2 focus-visible:ring-offset-black
                         px-4 py-3 text-sm sm:px-5 sm:py-3.5 sm:text-base md:px-6 md:py-4 md:text-base
                         min-h-[48px] sm:min-h-[44px]"
                aria-label={`More information about ${movie.Title}`}
              >
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span className="hidden xs:inline">More Info</span>
                <span className="xs:hidden">Info</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Optimized particle system - desktop only */}
      {shouldShowParticles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          {[...Array(particleCount)].map((_, i) => (
            <AnimatedParticle key={i} index={i} shouldAnimate={shouldShowParticles} />
          ))}
        </div>
      )}

      {/* Bottom fade - responsive height */}
      <div 
        className="absolute bottom-0 left-0 right-0 pointer-events-none
                   h-16 sm:h-20 md:h-24 lg:h-32"
        style={{
          background: 'linear-gradient(to top, rgb(0 0 0 / 1), transparent)'
        }}
        aria-hidden="true"
      />

      {/* Shimmer keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @media (max-width: 475px) {
          .xs\:block { display: block; }
          .xs\:inline { display: inline; }
          .xs\:hidden { display: none; }
        }
      `}</style>
    </section>
  );
};

export default memo(HeroSection);
import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { setSearch, fetchMovies } from "../../features/movies/moviesSlice";
import { useDebounce } from "../../hooks/useDebounce";

// Throttle utility for scroll performance
const throttle = (func, delay) => {
  let lastCall = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCall < delay) return;
    lastCall = now;
    return func(...args);
  };
};

const Navbar = () => {
  const dispatch = useDispatch();
  const prefersReducedMotion = useReducedMotion();
  const { search, loading } = useSelector((state) => state.movies);
  
  const [inputValue, setInputValue] = useState(search);
  const [isFocused, setIsFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTouched, setSearchTouched] = useState(false);
  
  const inputRef = useRef(null);
  const navRef = useRef(null);
  
  // Optimized debounce: 150ms for instant feel, minimum 3 characters
  const debouncedSearch = useDebounce(inputValue, 150);
  
  // Minimum character validation
  const shouldSearch = debouncedSearch.trim().length >= 3 || debouncedSearch.trim().length === 0;

  // Throttled scroll handler for performance
  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > 20);
    }, 100);
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smart search trigger - only when valid
  useEffect(() => {
    if (debouncedSearch !== search && shouldSearch) {
      dispatch(setSearch(debouncedSearch));
      dispatch(fetchMovies({ search: debouncedSearch }));
    }
  }, [debouncedSearch, dispatch, search, shouldSearch]);

  // Keyboard shortcut: "/" to focus search (like GitHub, Linear)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "/" && !isFocused && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      
      // Cmd/Ctrl + K for search (like Linear, Notion)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFocused]);

  const handleChange = useCallback((e) => {
    setInputValue(e.target.value);
    setSearchTouched(true);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue("");
    setSearchTouched(false);
    dispatch(setSearch(""));
    dispatch(fetchMovies({ search: "" }));
    inputRef.current?.focus();
  }, [dispatch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      if (inputValue) {
        setInputValue("");
        setSearchTouched(false);
      } else {
        inputRef.current?.blur();
      }
    }
  }, [inputValue]);

  // Search validation helper
  const showMinCharWarning = searchTouched && inputValue.trim().length > 0 && inputValue.trim().length < 3;

  return (
    <motion.nav
      ref={navRef}
      initial={prefersReducedMotion ? false : { y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
                 ${isScrolled 
                   ? "bg-black/95 backdrop-blur-xl shadow-2xl shadow-black/50" 
                   : "bg-gradient-to-b from-black/80 via-black/60 to-transparent"}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20">
          {/* Logo */}
          <motion.a
            href="/"
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            className="flex items-center gap-2 sm:gap-2.5 focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg p-1"
            aria-label="MovieApp home"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-md opacity-40" aria-hidden="true" />
              <svg className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 4h4v16H4V4zm6 0h4v16h-4V4zm6 0h4v16h-4V4z" />
              </svg>
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              <span className="text-red-600">Movie</span>
              <span className="text-white">App</span>
            </span>
          </motion.a>

          {/* Search and Actions Container */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Search bar with responsive width */}
            <div className="relative">
              <motion.div
                animate={{ 
                  width: isFocused 
                    ? "min(320px, calc(100vw - 200px))" 
                    : "min(240px, calc(100vw - 200px))"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`relative flex items-center transition-all duration-200
                          ${isFocused 
                            ? "ring-2 ring-red-500/50 shadow-lg shadow-red-500/20" 
                            : "ring-1 ring-white/10 hover:ring-white/20"}
                          rounded-full bg-white/5 backdrop-blur-md overflow-hidden`}
              >
                {/* Search icon with loading state */}
                <div className="absolute left-3 sm:left-4 pointer-events-none">
                  <motion.svg
                    animate={{ rotate: loading ? 360 : 0 }}
                    transition={{ 
                      duration: 1, 
                      repeat: loading ? Infinity : 0, 
                      ease: "linear" 
                    }}
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors
                              ${isFocused ? "text-red-500" : "text-gray-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </motion.svg>
                </div>

                <input
                  ref={inputRef}
                  type="search"
                  placeholder="Search movies..."
                  value={inputValue}
                  onChange={handleChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={handleKeyDown}
                  aria-label="Search movies"
                  aria-describedby={showMinCharWarning ? "search-hint" : undefined}
                  aria-invalid={showMinCharWarning}
                  className="w-full bg-transparent text-white placeholder-gray-400 
                           pl-10 sm:pl-12 pr-20 py-2 sm:py-2.5 md:py-3 text-sm focus:outline-none"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />

                {/* Keyboard shortcut hint */}
                {!isFocused && !inputValue && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hidden md:flex absolute right-3 items-center gap-1 pointer-events-none"
                  >
                    <kbd className="px-1.5 py-0.5 bg-white/10 text-gray-400 text-xs rounded border border-white/10">
                      /
                    </kbd>
                  </motion.div>
                )}

                {/* Clear button */}
                <AnimatePresence>
                  {inputValue && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onClick={handleClear}
                      className="absolute right-2 sm:right-3 p-1 rounded-full hover:bg-white/10 
                               transition-colors focus-visible:outline-none focus-visible:ring-2 
                               focus-visible:ring-red-500 focus-visible:ring-offset-1
                               focus-visible:ring-offset-black"
                      aria-label="Clear search"
                      type="button"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Minimum character warning */}
              <AnimatePresence>
                {showMinCharWarning && (
                  <motion.div
                    id="search-hint"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-2 px-3 py-2 bg-gray-900 
                             border border-yellow-600/50 rounded-lg text-xs text-yellow-400
                             shadow-lg shadow-black/50 z-50"
                    role="alert"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Type at least 3 characters to search</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User avatar */}
            <motion.button
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-600 
                       flex items-center justify-center text-white font-semibold text-xs sm:text-sm
                       ring-2 ring-white/20 hover:ring-white/40 transition-all
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                       focus-visible:ring-offset-2 focus-visible:ring-offset-black flex-shrink-0"
              aria-label="User menu"
              type="button"
            >
              U
            </motion.button>
          </div>
        </div>
      </div>

      {/* Loading progress bar */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600 origin-left"
            role="progressbar"
            aria-label="Loading movies"
            aria-busy="true"
          />
        )}
      </AnimatePresence>

      {/* Screen reader live region for search results */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {loading && "Searching for movies"}
        {!loading && inputValue.trim().length >= 3 && "Search complete"}
      </div>
    </motion.nav>
  );
};

export default Navbar;
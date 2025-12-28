import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { setPage, fetchMovies } from "../../features/movies/moviesSlice";
import { useCallback, useMemo } from "react";

const Pagination = () => {
  const dispatch = useDispatch();
  const { currentPage, totalPages, search, loading } = useSelector(
    (state) => state.movies
  );

  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= totalPages && !loading) {
      dispatch(setPage(page));
      dispatch(fetchMovies({ search, page }));
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [dispatch, search, totalPages, loading]);

  const pages = useMemo(() => {
    const result = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    // First page + ellipsis
    if (start > 1) {
      result.push({ type: "page", value: 1 });
      if (start > 2) result.push({ type: "ellipsis", value: "start" });
    }

    // Visible pages
    for (let i = start; i <= end; i++) {
      result.push({ type: "page", value: i });
    }

    // Ellipsis + last page
    if (end < totalPages) {
      if (end < totalPages - 1) result.push({ type: "ellipsis", value: "end" });
      result.push({ type: "page", value: totalPages });
    }

    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  const NavButton = ({ onClick, disabled, children, ariaLabel }) => (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
                 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900
                 ${disabled
                   ? "bg-gray-800/50 text-gray-600 cursor-not-allowed"
                   : "bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600"}`}
      aria-label={ariaLabel}
      aria-disabled={disabled}
    >
      {children}
    </motion.button>
  );

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 px-4"
      aria-label="Pagination navigation"
      role="navigation"
    >
      <NavButton
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        ariaLabel="Go to previous page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </NavButton>

      <div className="flex items-center gap-1" role="list" aria-label="Page numbers">
        <AnimatePresence mode="popLayout">
          {pages.map((item, index) => (
            <motion.div
              key={item.type === "page" ? item.value : `${item.type}-${item.value}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {item.type === "ellipsis" ? (
                <span className="px-3 py-2 text-gray-500" aria-hidden="true">
                  •••
                </span>
              ) : (
                <motion.button
                  onClick={() => handlePageChange(item.value)}
                  disabled={loading}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`relative w-10 h-10 rounded-xl font-semibold text-sm
                           transition-all duration-200 focus-visible:outline-none
                           focus-visible:ring-2 focus-visible:ring-red-500
                           ${item.value === currentPage
                             ? "text-white"
                             : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
                  aria-label={`Go to page ${item.value}`}
                  aria-current={item.value === currentPage ? "page" : undefined}
                >
                  {item.value === currentPage && (
                    <motion.div
                      layoutId="activePage"
                      className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 
                               rounded-xl shadow-lg shadow-red-600/30"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{item.value}</span>
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <NavButton
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        ariaLabel="Go to next page"
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </NavButton>

      {/* Page indicator for screen readers */}
      <div className="sr-only" aria-live="polite">
        Page {currentPage} of {totalPages}
      </div>
    </nav>
  );
};

export default Pagination;

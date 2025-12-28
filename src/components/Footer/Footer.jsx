import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.15, 
    rotate: [0, -10, 10, -10, 0],
    transition: { 
      rotate: {
        duration: 0.5,
        ease: "easeInOut"
      },
      scale: {
        duration: 0.2
      }
    }
  },
  tap: { scale: 0.9 }
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================
const useNewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1500);
  };

  return { email, setEmail, status, handleSubmit };
};

const useInView = () => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    const footer = document.getElementById("footer-component");
    if (footer) observer.observe(footer);

    return () => {
      if (footer) observer.unobserve(footer);
    };
  }, []);

  return isInView;
};

// ============================================================================
// MAIN FOOTER COMPONENT
// ============================================================================
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const isInView = useInView();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0.8, 1], [0.5, 1]);

  const socialLinks = [
    { 
      name: "GitHub", 
      icon: "M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z",
      color: "hover:bg-gray-700",
      hoverColor: "group-hover:text-white"
    },
    { 
      name: "Twitter", 
      icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
      color: "hover:bg-blue-600",
      hoverColor: "group-hover:text-white"
    },
    { 
      name: "Instagram", 
      icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
      color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600",
      hoverColor: "group-hover:text-white"
    },
    { 
      name: "LinkedIn", 
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
      color: "hover:bg-blue-700",
      hoverColor: "group-hover:text-white"
    },
  ];

  const quickLinks = [
    { label: "About Us", href: "#about", icon: "ℹ️" },
    { label: "Browse Movies", href: "#movies", icon: "🎬" },
    { label: "Trending", href: "#trending", icon: "🔥" },
    { label: "Categories", href: "#categories", icon: "📁" },
  ];

  const supportLinks = [
    { label: "Help Center", href: "#help", icon: "❓" },
    { label: "Contact Us", href: "#contact", icon: "📧" },
    { label: "FAQ", href: "#faq", icon: "💬" },
    { label: "Feedback", href: "#feedback", icon: "💭" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
    { label: "Cookie Policy", href: "#cookies" },
    { label: "DMCA", href: "#dmca" },
  ];

  return (
    <motion.footer
      id="footer-component"
      style={{ opacity }}
      className="relative bg-gradient-to-t from-black via-gray-900/95 to-gray-900/50 
                 pt-12 sm:pt-16 md:pt-20 pb-6 sm:pb-8 overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" 
             style={{ animationDelay: '1s' }} />
      </div>

      {/* Decorative top border with gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-red-600/5 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="space-y-8 sm:space-y-12"
        >
          {/* Top Section - Newsletter & Brand */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-8 sm:pb-12 
                       border-b border-gray-800/50"
          >
            {/* Brand & Description */}
            <div className="space-y-4 sm:space-y-6">
              <motion.div 
                className="flex items-center gap-2 sm:gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h4v16H4V4zm6 0h4v16h-4V4zm6 0h4v16h-4V4z" />
                  </svg>
                </motion.div>
                <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  MovieApp
                </span>
              </motion.div>

              <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-md">
                Discover, explore, and enjoy thousands of movies. Your ultimate destination 
                for entertainment with the latest releases and timeless classics.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <motion.div 
                  className="text-center"
                  whileHover={{ y: -2 }}
                >
                  <div className="text-xl sm:text-2xl font-bold text-red-500">10K+</div>
                  <div className="text-xs sm:text-sm text-gray-500">Movies</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ y: -2 }}
                >
                  <div className="text-xl sm:text-2xl font-bold text-red-500">50K+</div>
                  <div className="text-xs sm:text-sm text-gray-500">Users</div>
                </motion.div>
                <motion.div 
                  className="text-center"
                  whileHover={{ y: -2 }}
                >
                  <div className="text-xl sm:text-2xl font-bold text-red-500">4.8</div>
                  <div className="text-xs sm:text-sm text-gray-500">Rating</div>
                </motion.div>
              </div>
            </div>

            {/* Newsletter */}
            <NewsletterSection />
          </motion.div>

          {/* Middle Section - Links Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 
                       pb-8 sm:pb-12 border-b border-gray-800/50"
          >
            {/* Quick Links */}
            <LinkColumn title="Quick Links" links={quickLinks} showIcons />
            
            {/* Support */}
            <LinkColumn title="Support" links={supportLinks} showIcons />
            
            {/* Legal */}
            <LinkColumn title="Legal" links={legalLinks} />
            
            {/* App Download */}
            <AppDownloadSection />
          </motion.div>

          {/* Bottom Section - Social & Copyright */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col-reverse sm:flex-row items-center justify-between 
                       gap-6 sm:gap-8 pt-6 sm:pt-8 border-t border-gray-800/50"
          >
            {/* Copyright & Credits */}
            <div className="flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
              <p className="text-gray-500 text-xs sm:text-sm">
                © {currentYear} MovieApp. All rights reserved.
              </p>
              <motion.p 
                className="text-gray-600 text-xs flex flex-wrap items-center justify-center sm:justify-start gap-1.5"
                whileHover={{ scale: 1.02 }}
              >
                <span>Powered by</span>
                <a
                  href="https://www.omdbapi.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-400 transition-colors font-medium
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 
                           rounded px-1"
                >
                  OMDb API
                </a>
                <span>•</span>
                <span>Made with ❤️</span>
              </motion.p>
            </div>

            {/* Social Links */}
            <div className="flex flex-col items-center sm:items-end gap-3 sm:gap-4">
              <p className="text-gray-400 text-xs sm:text-sm font-medium tracking-wide uppercase">
                Connect With Us
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href="#"
                    variants={iconVariants}
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    custom={index}
                    className={`group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full 
                               bg-gradient-to-br from-gray-800 to-gray-900 
                               flex items-center justify-center
                               text-gray-400 ${social.color} transition-all duration-300
                               focus-visible:outline-none focus-visible:ring-2 
                               focus-visible:ring-red-500 focus-visible:ring-offset-2 
                               focus-visible:ring-offset-black
                               border border-gray-700/50 hover:border-gray-600
                               shadow-lg hover:shadow-xl`}
                    aria-label={social.name}
                  >
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${social.hoverColor}`} 
                         fill="currentColor" 
                         viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                    
                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 
                                   px-2 py-1 bg-gray-800 text-white text-xs rounded
                                   opacity-0 group-hover:opacity-100 transition-opacity
                                   whitespace-nowrap pointer-events-none
                                   border border-gray-700">
                      {social.name}
                    </span>

                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-full bg-red-600 opacity-0 
                                  group-hover:opacity-20 blur-md transition-opacity -z-10" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Back to Top (Mobile Only) */}
          <BackToTopMobile />
        </motion.div>
      </div>
    </motion.footer>
  );
};

// ============================================================================
// NEWSLETTER SECTION
// ============================================================================
const NewsletterSection = () => {
  const { email, setEmail, status, handleSubmit } = useNewsletterForm();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-bold text-white">
          Stay Updated
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm">
          Subscribe to get updates on new releases and exclusive content.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === "loading" || status === "success"}
            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-700 
                     rounded-lg sm:rounded-xl text-white placeholder-gray-500 text-sm sm:text-base
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     backdrop-blur-sm transition-all"
          />
          <motion.div
            className="absolute right-2 top-1/2 -translate-y-1/2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-red-600 to-red-700 
                       text-white text-sm sm:text-base font-medium rounded-lg sm:rounded-xl
                       hover:from-red-500 hover:to-red-600 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400
                       shadow-lg hover:shadow-red-500/50"
            >
              {status === "loading" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : status === "success" ? (
                "✓"
              ) : (
                "Subscribe"
              )}
            </button>
          </motion.div>
        </div>

        {status === "success" && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-green-500 text-xs sm:text-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Successfully subscribed!
          </motion.p>
        )}
      </form>
    </div>
  );
};

// ============================================================================
// LINK COLUMN
// ============================================================================
const LinkColumn = ({ title, links, showIcons = false }) => (
  <div className="space-y-4">
    <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
      {title}
    </h3>
    <nav className="flex flex-col space-y-2.5 sm:space-y-3">
      {links.map((link) => (
        <motion.a
          key={link.label}
          href={link.href}
          whileHover={{ x: 4, color: "#ffffff" }}
          className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 
                   rounded-sm w-fit flex items-center gap-2"
        >
          {showIcons && <span className="text-base">{link.icon}</span>}
          {link.label}
        </motion.a>
      ))}
    </nav>
  </div>
);

// ============================================================================
// APP DOWNLOAD SECTION
// ============================================================================
const AppDownloadSection = () => (
  <div className="space-y-4">
    <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
      Get The App
    </h3>
    <div className="flex flex-col gap-2.5 sm:gap-3">
      <motion.a
        href="#"
        whileHover={{ scale: 1.03, x: 2 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 
                 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg sm:rounded-xl
                 border border-gray-700 hover:border-gray-600 transition-all
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                 group"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" className="text-white"/>
        </svg>
        <div className="flex-1 text-left">
          <p className="text-[10px] sm:text-xs text-gray-400 leading-none mb-0.5">Download on</p>
          <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-gray-200">
            App Store
          </p>
        </div>
      </motion.a>

      <motion.a
        href="#"
        whileHover={{ scale: 1.03, x: 2 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 
                 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg sm:rounded-xl
                 border border-gray-700 hover:border-gray-600 transition-all
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
                 group"
      >
        <svg className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z" className="text-white"/>
        </svg>
        <div className="flex-1 text-left">
          <p className="text-[10px] sm:text-xs text-gray-400 leading-none mb-0.5">GET IT ON</p>
          <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-gray-200">
            Google Play
          </p>
        </div>
      </motion.a>
    </div>
  </div>
);

// ============================================================================
// BACK TO TOP (MOBILE)
// ============================================================================
const BackToTopMobile = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.button
      onClick={scrollToTop}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="sm:hidden w-full py-3 bg-gradient-to-r from-red-600 to-red-700
               text-white font-medium rounded-xl
               flex items-center justify-center gap-2
               hover:from-red-500 hover:to-red-600 transition-all
               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
               shadow-lg hover:shadow-red-500/50"
    >
      <span>Back to Top</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </motion.button>
  );
};

export default Footer;
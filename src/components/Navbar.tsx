import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown } from 'lucide-react';
import clubLogo from '@/assets/club-logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExcomOpen, setIsExcomOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Our Team', path: '/team' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const excomItems = [
    { name: 'Ex-Com 2024-25', path: '/excom-2024' },
    { name: 'Ex-Com 2023-24', path: '/excom-2023' },
    { name: 'Ex-Com 2022-23', path: '/excom-2022' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isExcomActive = () => {
    return excomItems.some(item => location.pathname === item.path);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 shadow-lg border-b border-club-teal/20'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.png" alt="Data Club Logo" className="h-10 w-10 lg:h-12 lg:w-12" />
            <span className="font-semibold text-lg lg:text-xl bg-gradient-to-r from-club-teal-light via-club-green to-club-teal bg-clip-text text-transparent">
              Data Vedhi.Club
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative ${
                  isActive(item.path)
                    ? 'text-club-green bg-club-green/10'
                    : 'text-club-teal-dark hover:text-club-green hover:club-green/5'
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-club-green"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            
            {/* Ex-Com Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExcomOpen(!isExcomOpen)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative flex items-center space-x-1 ${
                  isExcomActive()
                    ? 'text-club-green bg-club-green/10'
                    : 'text-club-teal-dark hover:text-club-green hover:bg-club-green/5'
                }`}
              >
                <span>Ex-Com</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${isExcomOpen ? 'rotate-180' : ''}`} />
                {isExcomActive() && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-club-green"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              
              <AnimatePresence>
                {isExcomOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 right-0 bg-background/95 backdrop-blur-md border border-club-teal/20 rounded-lg shadow-lg min-w-[200px] z-50"
                  >
                    {excomItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsExcomOpen(false)}
                        className={`block px-4 py-3 font-medium transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          isActive(item.path)
                            ? 'text-club-green bg-club-green/10'
                            : 'text-club-teal-dark hover:text-club-green hover:bg-club-green/5'
                        }`}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-club-orange/10 transition-colors text-club-teal-dark"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-background/95 backdrop-blur-md border-t border-club-teal/20"
            >
              <div className="py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-club-green bg-club-green/10'
                        : 'text-club-teal-dark hover:text-club-green hover:bg-club-green/5'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Ex-Com Section */}
                <div className="pt-2 border-t border-club-teal/20">
                  <div className="px-4 py-2 text-sm font-medium text-club-teal">Ex-Com</div>
                  {excomItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActive(item.path)
                          ? 'text-club-green bg-club-green/10'
                          : 'text-club-teal-dark hover:text-club-green hover:bg-club-green/5'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
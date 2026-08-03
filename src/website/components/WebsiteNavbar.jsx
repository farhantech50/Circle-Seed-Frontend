import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const WebsiteNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'About Us', path: '/about' },
    { title: 'Infrastructure', path: '/infrastructure' },
    { title: 'Products', path: '/products' },
    { title: 'News', path: '/news' },
    { title: 'Events', path: '/events' },
    // { title: 'Careers', path: '/careers' },
    { title: 'CSR', path: '/csr' },
    { title: 'Contact Us', path: '/contact' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 py-3'
          : 'bg-white py-5 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center transition-all duration-300">
          {/* Logo */}
          <div
            className="flex-shrink-0 flex items-center cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center mr-3 shadow-md group-hover:bg-emerald-700 transition-colors duration-300">
               <span className="text-white font-['Cinzel'] font-bold text-xl">CS</span>
            </div>
            <span className="text-2xl lg:text-3xl font-bold font-['Cinzel'] tracking-wide text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
              Circle <span className="text-emerald-600">Seed</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={index}
                  to={link.path}
                  className={`relative group px-1 py-2 font-['Montserrat'] text-[14px] font-semibold tracking-wide uppercase transition-colors duration-300 ${
                    isActive ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  {link.title}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-emerald-600 transition-all duration-300 ease-out ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-800 hover:text-emerald-600 focus:outline-none p-2"
            >
              <div className="w-6 flex flex-col items-end justify-center gap-1.5">
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 rounded-sm ${isOpen ? 'opacity-0' : 'w-5'}`}></span>
                <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`lg:hidden absolute w-full bg-white border-t border-gray-100 shadow-xl transition-all duration-300 ease-in-out origin-top ${
          isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="px-4 pt-4 pb-8 space-y-2">
          {navLinks.map((link, index) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={index}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 font-['Montserrat'] text-sm font-semibold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600 hover:border-l-4 hover:border-emerald-300'
                }`}
              >
                {link.title}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default WebsiteNavbar;


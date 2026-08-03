import React from 'react';
import { Link } from 'react-router-dom';

const WebsiteFooter = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-extrabold text-green-500 mb-4 tracking-tight">Circle Seed</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Empowering agriculture through innovation, superior seeds, and sustainable farming solutions. Cultivating a greener tomorrow.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-facebook-f text-xl"></i></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-twitter text-xl"></i></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-instagram text-xl"></i></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><i className="fab fa-linkedin-in text-xl"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-2 border-green-500 inline-block pb-1">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-green-400 transition">About Us</Link></li>
              <li><Link to="/products" className="text-gray-400 hover:text-green-400 transition">Our Products</Link></li>
              <li><Link to="/infrastructure" className="text-gray-400 hover:text-green-400 transition">Infrastructure</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-green-400 transition">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-green-400 transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Our Products */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-2 border-green-500 inline-block pb-1">Categories</h3>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-green-400 transition">Vegetable Seeds</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-green-400 transition">Field Crops</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-green-400 transition">Flower Seeds</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-green-400 transition">Fruit Seeds</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-green-400 transition">Organic Seeds</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 border-b-2 border-green-500 inline-block pb-1">Contact Us</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>CircleSeed Global HQ<br/>123 Agri Valley, Greenfield State 45678</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span>+1 (800) 123-SEED</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span>info@circleseed.com</span>
              </li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CircleSeed. All rights reserved.
          </p>
          <div className="space-x-4 mt-4 md:mt-0">
            <Link to="#" className="text-gray-500 hover:text-white text-sm transition">Privacy Policy</Link>
            <Link to="#" className="text-gray-500 hover:text-white text-sm transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default WebsiteFooter;

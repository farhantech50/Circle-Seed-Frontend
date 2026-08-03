import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  // --- Hero Slider State & Logic ---
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "https://www.shutterstock.com/image-photo/bottle-sunflower-oil-board-seeds-260nw-2774304261.jpg",
      badge: "Sowing Seeds of Innovation",
      title: "Cultivating a",
      highlight: "Better Tomorrow",
      description: "Premium quality seeds engineered for high yield, extreme climate resilience, and sustainable global farming.",
      btnText: "Explore Products",
      btnLink: "/products"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80",
      badge: "World-Class Infrastructure",
      title: "Science Meeting",
      highlight: "Agriculture",
      description: "State-of-the-art biotech laboratories ensuring 100% genetic purity and premium quality in every seed.",
      btnText: "Our Infrastructure",
      btnLink: "/infrastructure"
    },
    {
      id: 3,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_fMESo4FlxJiYOAaR2Vaz2m2keIdJ1WqeRmcK52SQ5Ta5C0kzYEAgPp1P&s=10",
      badge: "Partner With Us",
      title: "Growing Together",
      highlight: "Globally",
      description: "Join our international network of distributors and farmers to maximize yield and profitability.",
      btnText: "Partner Now",
      btnLink: "/partnership"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full font-sans">
      
      {/* 1. Hero Slider Section */}
      <section className="relative h-[100vh] overflow-hidden bg-gray-900">
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            {/* Background Image with slight zoom animation */}
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            ></div>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-transparent"></div>
            
            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
              <div className={`max-w-3xl transform transition-all duration-1000 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <span className="inline-block py-1.5 px-4 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 font-semibold text-sm mb-6 tracking-widest uppercase shadow-sm backdrop-blur-md">
                  {slide.badge}
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-white leading-tight tracking-tight">
                  {slide.title} <br/><span className="text-emerald-400">{slide.highlight}</span>
                </h1>
                <p className="text-base md:text-lg text-emerald-50/90 mb-6 max-w-2xl font-normal leading-relaxed">
                  {slide.description}
                </p>
                <div className="flex gap-4">
                  <Link 
                    to={slide.btnLink} 
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-base font-semibold rounded-xl text-center transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:-translate-y-1"
                  >
                    {slide.btnText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Controls (Dots) */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-3 z-20">
          {slides.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-emerald-400 w-8' : 'bg-white/50 hover:bg-white'}`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* 2. Welcome / About Preview Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h4 className="flex items-center text-emerald-600 font-bold uppercase tracking-widest mb-4 font-['Playfair_Display']">
                <span className="w-8 h-1 bg-emerald-600 mr-3"></span> Who We Are
              </h4>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 leading-tight font-['Playfair_Display']">
                Rooted in Science, <br/>Grown with Care.
              </h2>
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                Circle Seed is a premier agricultural organization committed to providing farmers with world-class, high-yielding seeds that withstand challenging environmental conditions. Our advanced research and development ensure that every seed is a promise of a better harvest.
              </p>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                With over four decades of legacy, we have revolutionized farming practices by integrating cutting-edge biotechnology with traditional agricultural wisdom.
              </p>
              <Link to="/about" className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors duration-300 shadow-md">
                Discover Our Story
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80" 
                  alt="Farmer in field" 
                  className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 hidden md:flex items-center gap-4">
                <div className="text-4xl font-extrabold text-emerald-600">40+</div>
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide leading-tight">Years of<br/>Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. End-to-End Supply Chain Section */}
      <section className="py-24 bg-white relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h4 className="flex items-center justify-center text-emerald-600 font-bold uppercase tracking-widest mb-3 font-['Playfair_Display']">
               From Lab to Land
            </h4>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 font-['Playfair_Display']">Our Integrated Supply Chain</h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">Discover the journey of Circle Seed from advanced biotechnology labs to farmers' hands through our robust distribution network.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">1. Manufacturing</h3>
              <p className="text-sm text-gray-600">State-of-the-art biotech processing and R&D facilities.</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">2. Quality Control</h3>
              <p className="text-sm text-gray-600">Rigorous lab testing for genetic purity and germination.</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">3. Smart Inventory</h3>
              <p className="text-sm text-gray-600">Climate-controlled warehousing and supply management.</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">4. Dealer & Retail</h3>
              <p className="text-sm text-gray-600">Massive network of wholesale dealers and local retailers.</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">5. Import / Export</h3>
              <p className="text-sm text-gray-600">Global sourcing and international distribution footprint.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Categories Section */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h4 className="flex items-center justify-center text-emerald-600 font-bold uppercase tracking-widest mb-3 font-['Playfair_Display']">
               Our Offerings
            </h4>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3 font-['Playfair_Display']">Premium Seed Categories</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto">Explore our wide range of carefully cultivated seeds designed for maximum yield and sustainability.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Category 1 */}
            <Link to="/products" className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 transform hover:-translate-y-2 border border-slate-100">
              <div className="h-72 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&q=80" alt="Vegetable Seeds" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                <h3 className="absolute bottom-8 left-8 text-xl font-medium text-white tracking-wide">Vegetable Seeds</h3>
              </div>
              <div className="p-8 relative">
                <div className="absolute -top-6 right-8 bg-emerald-500 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
                <p className="text-gray-600 text-base leading-relaxed">High-yielding, disease-resistant vegetable seeds perfectly suited for diverse climates and commercial farming.</p>
              </div>
            </Link>

            {/* Category 2 */}
            <Link to="/products" className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 transform hover:-translate-y-2 border border-slate-100">
              <div className="h-72 overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80" alt="Field Crops" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                <h3 className="absolute bottom-8 left-8 text-xl font-medium text-white tracking-wide">Field Crops</h3>
              </div>
              <div className="p-8 relative">
                <div className="absolute -top-6 right-8 bg-emerald-500 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
                <p className="text-gray-600 text-base leading-relaxed">Robust and resilient field crop seeds engineered for large-scale sustainable farming and food security.</p>
              </div>
            </Link>

            {/* Category 3 */}
            <Link to="/products" className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 transform hover:-translate-y-2 border border-slate-100">
              <div className="h-72 overflow-hidden relative">
                <img src="https://homesteadandchill.com/wp-content/uploads/2020/08/seed-save-flowers-annuals-cosmos.jpg" alt="Flower Seeds" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                <h3 className="absolute bottom-8 left-8 text-xl font-medium text-white tracking-wide">Flower Seeds</h3>
              </div>
              <div className="p-8 relative">
                <div className="absolute -top-6 right-8 bg-emerald-500 text-white p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
                <p className="text-gray-600 text-base leading-relaxed">Vibrant, beautiful, and easy-to-grow flower seeds with excellent germination rates for commercial nurseries.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Parallax Stats Section (Fixed Background) */}
      <section className="relative py-28 flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3 tracking-tight font-['Playfair_Display']">Our Global Impact</h2>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">We are proud of the footprint we've created in the global agricultural landscape through relentless innovation.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20">
              <div className="text-4xl font-semibold text-emerald-400 mb-3">40+</div>
              <div className="text-emerald-50 font-medium tracking-wide uppercase text-sm">Years Experience</div>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20">
              <div className="text-4xl font-semibold text-emerald-400 mb-3">150+</div>
              <div className="text-emerald-50 font-medium tracking-wide uppercase text-sm">Seed Varieties</div>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20">
              <div className="text-4xl font-semibold text-emerald-400 mb-3">10M+</div>
              <div className="text-emerald-50 font-medium tracking-wide uppercase text-sm">Farmers Served</div>
            </div>
            <div className="bg-white/10 p-8 rounded-3xl backdrop-blur-md border border-white/20">
              <div className="text-4xl font-semibold text-emerald-400 mb-3">25+</div>
              <div className="text-emerald-50 font-medium tracking-wide uppercase text-sm">Countries Reached</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Research & Innovation Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTnhUq2KmyFzeFjIYr8ggqqK-F1diO8kJEgIQwjjlUUGB2yi9L6XcqFC0&s=10" alt="Lab Testing" className="rounded-2xl w-full h-64 object-cover shadow-lg" />
              <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80" alt="Microscope" className="rounded-2xl w-full h-64 object-cover shadow-lg mt-8" />
            </div>
            <div className="lg:w-1/2">
              <h4 className="flex items-center text-emerald-600 font-bold uppercase tracking-widest mb-4 font-['Playfair_Display']">
                <span className="w-8 h-1 bg-emerald-600 mr-3"></span> Innovation Center
              </h4>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4 font-['Playfair_Display']">Pioneering Agricultural Research</h2>
              <p className="text-base text-gray-600 mb-6 leading-relaxed">
                At Circle Seed, research is the backbone of everything we do. Our state-of-the-art biotechnology labs are constantly working to develop seeds that are more resilient, higher yielding, and nutritionally rich.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-700 text-base">Advanced DNA marker technology for precision breeding.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-700 text-base">Strict quality control protocols for physical and genetic purity.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-emerald-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  <span className="text-gray-700 text-base">Continuous trial farming across multiple climatic zones.</span>
                </li>
              </ul>
              <Link to="/infrastructure" className="text-emerald-600 font-semibold hover:text-emerald-800 flex items-center group">
                Explore Our Infrastructure
                <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Latest News Preview Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-6">
            <div>
              <h4 className="text-emerald-600 font-bold uppercase tracking-widest mb-2 font-['Playfair_Display']">Media & Updates</h4>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 font-['Playfair_Display']">Latest News</h2>
            </div>
            <Link to="/news" className="hidden sm:flex text-emerald-600 font-semibold hover:text-emerald-800 items-center">
              View All News
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* News 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRARFieghHDok1NTgsw-ob8j8ZoMJtrDp5ih9jPfpHmng&s" alt="News" className="w-full h-48 object-cover" />
              <div className="p-6">
                <span className="text-xs font-semibold text-emerald-600 mb-2 block uppercase tracking-wide">June 15, 2026</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">Circle Seed Launches Drought-Resistant Wheat Variety</h3>
                <Link to="/news" className="text-sm font-medium text-gray-500 hover:text-emerald-600">Read Article &rarr;</Link>
              </div>
            </div>
            {/* News 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100">
              <img src="https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&q=80" alt="News" className="w-full h-48 object-cover" />
              <div className="p-6">
                <span className="text-xs font-semibold text-emerald-600 mb-2 block uppercase tracking-wide">May 20, 2026</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">Annual Farmer Award Ceremony Celebrates Success</h3>
                <Link to="/news" className="text-sm font-medium text-gray-500 hover:text-emerald-600">Read Article &rarr;</Link>
              </div>
            </div>
            {/* News 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8ojRNj3niYucNoPgG3Ue2GkhukTo_lo3mD5I-XQMBZ6-7pNLZyaqP-l0&s=10" alt="News" className="w-full h-48 object-cover" />
              <div className="p-6">
                <span className="text-xs font-semibold text-emerald-600 mb-2 block uppercase tracking-wide">April 10, 2026</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">New Research Facility Opens in Greenfield</h3>
                <Link to="/news" className="text-sm font-medium text-gray-500 hover:text-emerald-600">Read Article &rarr;</Link>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Link to="/news" className="inline-block text-emerald-600 font-semibold hover:text-emerald-800">
              View All News &rarr;
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

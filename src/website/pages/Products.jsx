import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Vegetable Seeds', 'Field Crops', 'Flower Seeds'];

  const products = [
    { id: 1, name: "Tomato Super Hybrid F1", category: "Vegetable Seeds", image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80", features: ["High Yield", "Disease Resistant"], harvest: "60-65 Days" },
    { id: 2, name: "Premium Green Cabbage", category: "Vegetable Seeds", image: "https://tiimg.tistatic.com/fp/0/006/041/fresh-cabbage-629.jpg", features: ["Heat Tolerant", "Dense Head"], harvest: "70-75 Days" },
    { id: 3, name: "Spicy Red Chili", category: "Vegetable Seeds", image: "https://image.made-in-china.com/2f0j00qOlizecGJufU/High-Quality-Rich-Flavored-Spicy-Red-Milled-Chili-Peppers-Suitable-for-Restaurants-and-Canteens-Free-Delivery-Service-Is-Available-.webp", features: ["High Pungency", "Long Shelf Life"], harvest: "80 Days" },
    { id: 4, name: "Golden Hybrid Maize", category: "Field Crops", image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80", features: ["Drought Resistant", "High Kernel Count"], harvest: "110-120 Days" },
    { id: 5, name: "Premium Basmati Rice", category: "Field Crops", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80", features: ["Aromatic", "Long Grain"], harvest: "135 Days" },
    { id: 6, name: "High-Yield Wheat", category: "Field Crops", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80", features: ["Rust Resistant", "High Protein"], harvest: "120 Days" },
    { id: 7, name: "Marigold Special Orange", category: "Flower Seeds", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxVqNsm7dNd3qW1Q4D5IFntPOy1oEo4qr-GfXlkbYJcf_S0PvIt0Lypz8&s=10", features: ["Big Blooms", "Weather Tolerant"], harvest: "45-50 Days" },
    { id: 8, name: "Giant Sunflower", category: "Flower Seeds", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0UC3uAuqTTmzsnSLHmZAVkD_7oHgQWI4s1n-rntsK2g&s=10", features: ["High Oil Content", "Uniform Growth"], harvest: "90-100 Days" },
  ];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="w-full bg-slate-50 pb-20 font-sans">
      
      {/* Hero Banner */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-900/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-emerald-50 font-medium text-xs mb-4 tracking-wider uppercase backdrop-blur-md border border-white/20">
            Premium Quality Assured
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Our Seed <span className="text-emerald-400">Collection</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-normal leading-relaxed">
            Discover our scientifically developed, high-yielding seed varieties designed to empower farmers and ensure a sustainable harvest.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Advanced Filters */}
        <div className="flex flex-wrap justify-center mb-12 gap-3">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 shadow-sm border ${
                activeCategory === cat 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1">
              
              {/* Image Container with Badges & Hover Effects */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <button className="px-6 py-2 bg-white text-emerald-700 font-bold rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-emerald-50">
                     Quick View
                   </button>
                </div>
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-emerald-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {product.category}
                  </span>
                </div>
              </div>
              
              {/* Content Container */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">{product.name}</h3>
                
                {/* Features List */}
                <div className="mb-4 flex-grow">
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {feature}
                      </li>
                    ))}
                    <li className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Harvest: {product.harvest}
                    </li>
                  </ul>
                </div>

                {/* Divider & Action */}
                <div className="pt-4 border-t border-gray-100 mt-auto flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Premium Seed</span>
                  <Link to={`/products/${product.id}`} className="text-emerald-600 font-bold hover:text-emerald-800 flex items-center transition-colors">
                    Details
                    <svg className="ml-1 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Products;

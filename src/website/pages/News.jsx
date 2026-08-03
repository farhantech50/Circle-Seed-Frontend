import React from 'react';

const News = () => {
  const newsItems = [
    { 
      title: "Circle Seed Launches Drought-Resistant Wheat Variety", 
      date: "June 15, 2026", 
      category: "Product Launch", 
      excerpt: "Our new wheat variety is expected to increase yield by 20% in arid regions...",
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80"
    },
    { 
      title: "Annual Farmer Award Ceremony 2026", 
      date: "May 20, 2026", 
      category: "Company Update", 
      excerpt: "Celebrating the hard work and success of our partner farmers across the nation...",
      image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80"
    },
    { 
      title: "New Research Facility Opens in Greenfield", 
      date: "April 10, 2026", 
      category: "Infrastructure", 
      excerpt: "State-of-the-art biotech lab will accelerate our seed breeding programs...",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80"
    },
  ];

  return (
    <div className="w-full font-sans">
      {/* Hero Banner */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-900/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-emerald-50 font-medium text-xs mb-4 tracking-wider uppercase backdrop-blur-md border border-white/20">
            Updates
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Latest <span className="text-emerald-400">News</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-normal leading-relaxed">
            Stay updated with our newest innovations, launches, and company milestones.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsItems.map((news, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition flex flex-col group">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={news.image} 
                alt={news.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
            </div>
            <div className="p-8 flex-grow flex flex-col">
              <span className="text-sm font-semibold text-emerald-600 mb-2 block">{news.category} • {news.date}</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 line-clamp-2">{news.title}</h3>
              <p className="text-gray-600 mb-6 flex-grow">{news.excerpt}</p>
              <button className="text-emerald-600 font-medium hover:text-emerald-800 flex items-center mt-auto w-max group-hover:text-emerald-700 transition-colors">
                Read Full Article
                <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default News;

import React from 'react';

const About = () => {
  return (
    <div className="w-full">
      {/* Hero Header */}
      {/* Hero Banner */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-900/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-emerald-50 font-medium text-xs mb-4 tracking-wider uppercase backdrop-blur-md border border-white/20">
            Our Story
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            About <span className="text-emerald-400">Circle Seed</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-normal leading-relaxed">
            Cultivating excellence and innovation in agriculture for over four decades.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Journey</h2>
            <p className="text-base text-gray-600 mb-4 leading-relaxed">
              Founded with a mission to empower farmers, Circle Seed has grown into a globally recognized agricultural powerhouse. We specialize in producing high-yielding, disease-resistant seeds tailored for diverse agro-climatic conditions.
            </p>
            <p className="text-base text-gray-600 leading-relaxed">
              Through rigorous research and a deep understanding of farmer needs, we have introduced over 150 unique seed varieties that enhance food security and profitability.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80" alt="Agriculture field" className="w-full h-[400px] object-cover" />
          </div>
        </div>

        {/* Our Business Ecosystem */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Our Business Ecosystem</h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">From cutting-edge manufacturing to local farmers' hands, our fully integrated supply chain is built for reliability and scale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-2">1. Manufacturing & QC</h3>
              <p className="text-sm text-emerald-900/80">In-house production ensuring 100% genetic purity and superior germination rates through rigorous lab testing.</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-2">2. Smart Inventory</h3>
              <p className="text-sm text-emerald-900/80">Massive climate-controlled warehousing facilities managing supply flawlessly across all seasons.</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-2">3. Import & Export</h3>
              <p className="text-sm text-emerald-900/80">Expanding our agricultural footprint globally through robust international trade and sourcing partnerships.</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="text-lg font-bold text-emerald-800 mb-2">4. Dealer & Retail Network</h3>
              <p className="text-sm text-emerald-900/80">A massive distribution network empowering wholesale dealers and reaching retail farmers directly.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow border border-green-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Mission</h3>
            <p className="text-base text-gray-600">To revolutionize agriculture by providing farmers with the highest quality, scientifically advanced seeds.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow border border-gray-100">
            <div className="mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Vision</h3>
            <p className="text-base text-gray-600">To be the global leader in sustainable seed technology, ensuring a food-secure world for future generations.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow border border-gray-100">
            <div className="mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Values</h3>
            <p className="text-base text-gray-600">Integrity, Quality, Innovation, and Farmer-Centricity form the core pillars of everything we do at Circle Seed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

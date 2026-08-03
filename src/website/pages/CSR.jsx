import React from 'react';

const CSR = () => {
  return (
    <div className="w-full font-sans">
      {/* Hero Banner */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-900/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-emerald-50 font-medium text-xs mb-4 tracking-wider uppercase backdrop-blur-md border border-white/20">
            Giving Back
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Corporate Social <span className="text-emerald-400">Responsibility</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-normal leading-relaxed">
            Growing together with the community. We believe in giving back and ensuring sustainable livelihoods for farmers.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-green-50 p-10 rounded-3xl">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Farmer Education Programs</h2>
          <p className="text-base text-green-900 leading-relaxed mb-6">
            We conduct free workshops and training sessions for marginalized farmers, teaching them modern agricultural techniques, water conservation, and optimal seed usage to maximize their yield and income.
          </p>
          <img src="https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&q=80" alt="Farmer Education" className="rounded-2xl w-full h-48 object-cover shadow-md" />
        </div>

        <div className="bg-green-50 p-10 rounded-3xl">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Environmental Sustainability</h2>
          <p className="text-base text-green-900 leading-relaxed mb-6">
            Circle Seed is committed to reducing the carbon footprint of agriculture. We promote zero-tillage farming, distribute organic bio-fertilizers, and run massive tree plantation drives across rural regions.
          </p>
          <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80" alt="Environment" className="rounded-2xl w-full h-48 object-cover shadow-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
        <div className="bg-green-50 p-10 rounded-3xl">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Empowering Our Dealer Network</h2>
          <p className="text-base text-green-900 leading-relaxed mb-6">
            Our wholesale dealers are the bridge between us and the farmers. We conduct rigorous training and capacity-building programs for our dealers, equipping them with the knowledge to educate farmers on crop rotation, seed selection, and climate resilience.
          </p>
          <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80" alt="Dealer Training" className="rounded-2xl w-full h-48 object-cover shadow-md" />
        </div>

        <div className="bg-green-50 p-10 rounded-3xl">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">Accessible Retail Reach</h2>
          <p className="text-base text-green-900 leading-relaxed mb-6">
            We are committed to ensuring that our retail distribution chain reaches the most remote areas. Through fair trade policies and transparent supply chain practices, we guarantee that smallholder farmers get high-quality seeds at fair and affordable prices.
          </p>
          <img src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80" alt="Retail Reach" className="rounded-2xl w-full h-48 object-cover shadow-md" />
        </div>
      </div>
      </div>
    </div>
  );
};

export default CSR;

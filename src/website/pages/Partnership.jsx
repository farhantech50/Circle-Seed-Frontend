import React from 'react';

const Partnership = () => {
  return (
    <div className="w-full font-sans">
      {/* Hero Banner */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-900/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-emerald-50 font-medium text-xs mb-4 tracking-wider uppercase backdrop-blur-md border border-white/20">
            Grow Together
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Partner <span className="text-emerald-400">With Us</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-normal leading-relaxed">
            Become a part of our growing global network of distributors, dealers, and agricultural partners.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Why Partner With Circle Seed?</h2>
          <ul className="space-y-4 text-base text-gray-700">
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Access to a diverse portfolio of high-yielding, premium seeds.
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Attractive margins and distributor incentive programs.
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Extensive marketing and promotional support.
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              Dedicated technical assistance and agronomist support.
            </li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Distributor Application Form</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" placeholder="Agri Solutions Ltd." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message / Proposal</label>
              <textarea rows="4" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500" placeholder="Tell us about your distribution network..."></textarea>
            </div>
            <button type="button" className="w-full bg-green-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-700 transition shadow-md">
              Submit Application
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Partnership;

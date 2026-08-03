import React from 'react';

const Careers = () => {
  return (
    <div className="w-full">
      {/* Hero Banner */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-900/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-emerald-50 font-medium text-xs mb-4 tracking-wider uppercase backdrop-blur-md border border-white/20">
            Join Our Team
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Build Your <span className="text-emerald-400">Career With Us</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-normal leading-relaxed">
            Join a team of passionate professionals dedicated to revolutionizing global agriculture.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white p-8 rounded-2xl shadow border border-gray-100 mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Why Circle Seed?</h2>
          <p className="text-base text-gray-600 mb-4 leading-relaxed">We offer a dynamic, inclusive, and innovative work environment where your ideas can directly impact global food security. Enjoy competitive benefits, continuous learning, and opportunities to grow.</p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Current Openings</h2>
        
        <div className="space-y-6">
          {/* Job 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Senior Agronomist</h3>
              <div className="flex space-x-4 text-sm text-gray-500 mb-4 md:mb-0">
                <span>📍 Global HQ</span>
                <span>🕒 Full-time</span>
                <span>💼 R&D</span>
              </div>
            </div>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Apply Now</button>
          </div>

          {/* Job 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Area Sales Manager</h3>
              <div className="flex space-x-4 text-sm text-gray-500 mb-4 md:mb-0">
                <span>📍 Regional Office</span>
                <span>🕒 Full-time</span>
                <span>💼 Sales & Marketing</span>
              </div>
            </div>
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Apply Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;

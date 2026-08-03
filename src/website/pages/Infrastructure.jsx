import React from 'react';
import { Link } from 'react-router-dom';

const Infrastructure = () => {
  return (
    <div className="w-full font-sans bg-white text-gray-800">
      
      {/* Hero Banner (Modern & Clean) */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-900/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-emerald-50 font-medium text-xs mb-4 tracking-wider uppercase backdrop-blur-md border border-white/20">
            World-Class Facilities
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Our <span className="text-emerald-400">Infrastructure</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-normal leading-relaxed">
            Equipped with state-of-the-art technology to ensure the highest seed quality, genetic purity, and optimum viability.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-slate-50 relative">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">Built for Excellence</h2>
          <p className="text-base text-gray-600 leading-relaxed">
            At Circle Seed, our infrastructure is the backbone of our promise to deliver premium seeds. From advanced biotechnology labs to massive climate-controlled warehouses, every facility is designed to meet international standards of agricultural excellence.
          </p>
          <div className="w-16 h-1 bg-emerald-500 mx-auto mt-8 rounded-full"></div>
        </div>
      </section>

      {/* Alternating Infrastructure Blocks */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          {/* Research & Development (R&D) */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Research & Development</h2>
              </div>
              <p className="text-base text-gray-600 leading-relaxed mb-6">
                Our advanced biotechnology laboratories and multi-location trial farms are the birthplace of our premium seed varieties. With a dedicated team of agronomists, geneticists, and breeders, we continuously innovate to develop high-yield, disease-resistant seeds.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700 text-base">
                  <div className="mr-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Advanced Molecular Biology Labs
                </li>
                <li className="flex items-center text-gray-700 text-base">
                  <div className="mr-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  High-Tech Tissue Culture Facilities
                </li>
                <li className="flex items-center text-gray-700 text-base">
                  <div className="mr-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Multi-location Trial & Breeding Farms
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2 w-full">
              <div className="relative rounded-3xl overflow-hidden shadow-lg group">
                <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80" alt="R&D Lab" className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Seed Processing Plants */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 w-full">
              <div className="relative rounded-3xl overflow-hidden shadow-lg group">
                <img src="https://agritech.tnau.ac.in/seed_certification/processing%20equip.jpg" alt="Processing Plant" className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Seed Processing Plants</h2>
              </div>
              <p className="text-base text-gray-600 leading-relaxed mb-6">
                We employ fully automated, state-of-the-art seed processing machinery imported from global leaders. This ensures that our seeds are meticulously cleaned, graded, treated, and packed to maintain supreme vigor and germination capacity.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700 text-base">
                  <div className="mr-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Fully Automated Grading & Sorting
                </li>
                <li className="flex items-center text-gray-700 text-base">
                  <div className="mr-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  High-Precision Seed Treatment Technology
                </li>
              </ul>
            </div>
          </div>

          {/* Quality Control (QC) Labs */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 order-2 lg:order-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Quality Control (QC) Labs</h2>
              </div>
              <p className="text-base text-gray-600 leading-relaxed mb-6">
                Our strict QC protocols are the heartbeat of our operations. Before any seed enters our inventory, it undergoes rigorous testing for genetic purity, physical purity, moisture content, and germination vigor.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700 text-base">
                  <div className="mr-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  DNA Fingerprinting & Genetic Purity Checks
                </li>
                <li className="flex items-center text-gray-700 text-base">
                  <div className="mr-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Controlled Environment Germination Testing
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2 order-1 lg:order-2 w-full">
              <div className="relative rounded-3xl overflow-hidden shadow-lg group">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80" alt="QC Lab" className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Smart Warehousing & Inventory */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 w-full">
              <div className="relative rounded-3xl overflow-hidden shadow-lg group">
                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80" alt="Smart Warehousing" className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Smart Warehousing & Inventory</h2>
              </div>
              <p className="text-base text-gray-600 leading-relaxed mb-6">
                Post-QC, seeds are transferred to our massive climate-controlled inventory facilities. Advanced ERP integrations allow us to manage stock seamlessly, preparing for wholesale dealer dispatch and retail supply.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700 text-base">
                  <div className="mr-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Temperature & Humidity Controlled Storage
                </li>
                <li className="flex items-center text-gray-700 text-base">
                  <div className="mr-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  Automated ERP-Driven Stock Management
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-50 py-16 border-t border-emerald-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-semibold text-gray-800 mb-4 tracking-tight">Experience Our Quality Firsthand</h2>
          <p className="text-base text-gray-600 mb-8 leading-relaxed">
            Partner with us to gain access to world-class seeds backed by unmatched agricultural infrastructure. Let's cultivate success together.
          </p>
          <Link 
            to="/contact" 
            className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 text-white font-medium text-base rounded-lg shadow-md hover:bg-emerald-700 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Contact Us Today
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
        </div>
      </section>
      
    </div>
  );
};

export default Infrastructure;

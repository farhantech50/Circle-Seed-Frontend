import React from 'react';

const Contact = () => {
  return (
    <div className="w-full bg-gray-50 pb-20">
      {/* Hero Banner */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-900/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-emerald-50 font-medium text-xs mb-4 tracking-wider uppercase backdrop-blur-md border border-white/20">
            Get In Touch
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Contact <span className="text-emerald-400">Us</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-normal leading-relaxed">
            We are here to help and answer any question you might have. We look forward to hearing from you.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-50px] relative z-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Contact Information */}
          <div className="bg-green-700 text-white p-10 md:w-2/5">
            <h3 className="text-2xl font-semibold mb-4">Get in touch</h3>
            <p className="text-green-100 mb-10">Fill up the form and our Team will get back to you within 24 hours.</p>
            
            <div className="space-y-6 text-green-50">
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span>+1 (800) 123-SEED</span>
              </div>
              <div className="flex items-center">
                <svg className="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span>info@circleseed.com</span>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>Circle Seed Global HQ<br/>123 Agri Valley,<br/>Greenfield State 45678</span>
              </div>
            </div>

            <div className="mt-16 flex space-x-4">
              {/* Social Icons Placeholder */}
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center cursor-pointer hover:bg-green-500 transition"><i className="fab fa-facebook-f"></i></div>
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center cursor-pointer hover:bg-green-500 transition"><i className="fab fa-twitter"></i></div>
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center cursor-pointer hover:bg-green-500 transition"><i className="fab fa-linkedin-in"></i></div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="p-10 md:w-3/5">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                  <input type="text" className="w-full border-b-2 border-gray-300 px-0 py-2 focus:ring-0 focus:border-green-600 outline-none transition" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                  <input type="email" className="w-full border-b-2 border-gray-300 px-0 py-2 focus:ring-0 focus:border-green-600 outline-none transition" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" className="w-full border-b-2 border-gray-300 px-0 py-2 focus:ring-0 focus:border-green-600 outline-none transition" placeholder="How can we help?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows="4" className="w-full border-b-2 border-gray-300 px-0 py-2 focus:ring-0 focus:border-green-600 outline-none transition" placeholder="Write your message here..."></textarea>
              </div>
              <div className="text-right">
                <button type="button" className="inline-block bg-green-600 text-white font-medium py-3 px-8 rounded-full hover:bg-green-700 transition shadow-lg">
                  Send Message
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;

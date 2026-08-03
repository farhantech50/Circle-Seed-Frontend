import React, { useState } from 'react';

const Events = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const eventsList = [
    { 
      name: "AgriTech Expo 2026", 
      date: "August 12-14, 2026", 
      location: "Global Exhibition Center", 
      status: "Upcoming",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80"
    },
    { 
      name: "National Farmers Meet", 
      date: "September 05, 2026", 
      location: "Circle Seed HQ", 
      status: "Upcoming",
      image: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=800&q=80"
    },
    { 
      name: "Seed Quality Workshop", 
      date: "February 18, 2026", 
      location: "Regional R&D Center", 
      status: "Completed",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
    },
    { 
      name: "International Agricultural Fair", 
      date: "January 10-15, 2026", 
      location: "Trade Center, Dhaka", 
      status: "Completed",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQM5Wmf2Of43XlLZnrfZa998-SrceboAvMUrw&s"
    }
  ];

  return (
    <div className="w-full font-sans relative">
      {/* Hero Banner */}
      <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed opacity-90" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-900/50"></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto mt-10">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-emerald-50 font-medium text-xs mb-4 tracking-wider uppercase backdrop-blur-md border border-white/20">
            Meet Us
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Events & <span className="text-emerald-400">Exhibitions</span>
          </h1>
          <p className="text-base md:text-lg text-emerald-50 font-normal leading-relaxed">
            Join us at global expos, farmer meets, and technical workshops.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsList.map((evt, idx) => (
            <div key={idx} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div 
                className="relative h-64 overflow-hidden cursor-pointer"
                onClick={() => setSelectedEvent(evt)}
              >
                <img 
                  src={evt.image} 
                  alt={evt.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                  <div className="bg-white/90 p-3 rounded-full backdrop-blur-sm shadow-lg text-emerald-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </div>
                </div>
                <span className={`absolute top-4 right-4 inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${evt.status === 'Upcoming' ? 'bg-green-100/90 text-green-800' : 'bg-white/90 text-gray-800'}`}>
                  {evt.status}
                </span>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{evt.name}</h3>
                <div className="flex flex-col space-y-2 text-gray-500 mb-6 flex-grow">
                  <span className="flex items-center text-sm"><svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>{evt.date}</span>
                  <span className="flex items-center text-sm"><svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>{evt.location}</span>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setSelectedEvent(null)}>
          <div 
            className="relative bg-white rounded-2xl overflow-hidden max-w-5xl w-full shadow-2xl flex flex-col md:flex-row animate-in fade-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            
            {/* Image Section */}
            <div className="w-full md:w-3/5 lg:w-2/3 h-[40vh] md:h-auto md:min-h-[60vh] bg-gray-900 flex items-center justify-center relative">
              <img 
                src={selectedEvent.image} 
                alt={selectedEvent.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden"></div>
            </div>
            
            {/* Content Section */}
            <div className="w-full md:w-2/5 lg:w-1/3 p-6 sm:p-8 flex flex-col bg-white">
              <div className="mb-auto">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${selectedEvent.status === 'Upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {selectedEvent.status}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight">{selectedEvent.name}</h2>
                
                <div className="space-y-5 mb-8">
                  <div className="flex items-start bg-gray-50 p-4 rounded-xl">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedEvent.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start bg-gray-50 p-4 rounded-xl">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900">Location</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>
              </div>
              

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;

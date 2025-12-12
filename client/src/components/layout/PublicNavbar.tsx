import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import type { Program } from '../../types/program.types';
import type { CboEvent } from '../../types/event.types';

const PublicNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [allEvents, setAllEvents] = useState<CboEvent[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch Data for Search
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const [progRes, eventRes] = await Promise.all([
          apiClient.get('/programs'),
          apiClient.get('/events')
        ]);
        setAllPrograms(progRes.data);
        setAllEvents(eventRes.data);
      } catch (error) {
        console.error("Search data load failed", error);
      }
    };
    loadSearchData();
  }, []);

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Logic
  const filteredPrograms = allPrograms.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const filteredEvents = allEvents.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 3);

  const hasResults = filteredPrograms.length > 0 || filteredEvents.length > 0;

  const isActive = (path: string) => location.pathname === path 
    ? 'text-primary font-bold bg-purple-50 px-3 py-1 rounded-full' 
    : 'text-gray-600 hover:text-primary hover:bg-gray-50 px-3 py-1 rounded-full transition-all';

  const handleResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    // GLASS EFFECT NAVBAR
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">
          
          {/* 1. LOGO */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="text-2xl font-extrabold text-primary flex items-center gap-2 tracking-tight group">
              <span className="bg-gradient-to-br from-primary to-secondary text-white w-10 h-10 rounded-xl flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
                JC
              </span>
              <span className="hidden sm:block">Jayness CBO</span>
            </Link>
          </div>

          {/* 2. SEARCH BAR (Hidden on small screens, Visible on LG+) */}
          <div className="hidden lg:flex flex-1 max-w-md relative mx-4" ref={searchRef}>
            <div className="w-full relative group">
              <input 
                type="text"
                placeholder="Search..."
                className="w-full bg-gray-100 text-gray-700 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white border border-transparent focus:border-primary/30 transition-all"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(e.target.value.length > 0);
                }}
                onFocus={() => {
                  if (searchQuery.length > 0) setShowResults(true);
                }}
              />
              <span className="absolute left-3.5 top-2.5 text-gray-400 group-focus-within:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>

              {/* SEARCH RESULTS DROPDOWN */}
              {showResults && searchQuery && (
                <div className="absolute top-14 left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-2 animate-fade-in-up ring-1 ring-black/5">
                  {hasResults ? (
                    <>
                      {filteredPrograms.length > 0 && (
                        <div className="mb-2">
                          <h4 className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">Programs</h4>
                          {filteredPrograms.map(p => (
                            <button 
                              key={p._id}
                              onClick={() => handleResultClick(`/public/programs/${p._id}`)}
                              className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 transition group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-200 overflow-hidden shrink-0 shadow-sm group-hover:shadow">
                                <img src={p.image} alt="" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-sm font-medium text-gray-700 truncate">{p.title}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredEvents.length > 0 && (
                        <div>
                          <h4 className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">Events</h4>
                          {filteredEvents.map(e => (
                            <button 
                              key={e._id}
                              onClick={() => handleResultClick(`/public/events/${e._id}`)}
                              className="w-full text-left px-4 py-2 hover:bg-purple-50 flex items-center gap-3 transition group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0 text-center flex flex-col justify-center border border-gray-200 group-hover:border-primary/30">
                                <span className="text-[9px] font-bold text-primary">
                                  {new Date(e.date).getDate()}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-700 truncate">{e.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-sm text-gray-500 text-center italic">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 3. DESKTOP LINKS (Visible only on LG+) */}
          {/* Changed 'md:flex' to 'lg:flex' to fix overlapping */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/about" className={isActive('/about')}>About</Link>
            <Link to="/public/programs" className={isActive('/public/programs')}>Programs</Link>
            <Link to="/public/events" className={isActive('/public/events')}>Events</Link>
            <Link to="/impact" className={isActive('/impact')}>Impact</Link>
            <Link to="/contact" className={isActive('/contact')}>Contact</Link>
            
            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 mx-3"></div>

            <div className="flex items-center space-x-3">
              <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary transition px-2">
                Log In
              </Link>
              <Link to="/join" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-purple-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 transform active:scale-95 flex items-center gap-1">
                <span>Join Us</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>

          {/* 4. MOBILE MENU BUTTON (Visible up to LG) */}
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-primary focus:outline-none p-2 rounded-md hover:bg-gray-50 transition">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 py-4 shadow-xl animate-fade-in-down absolute w-full left-0 z-50">
          
          {/* Mobile Search */}
          <div className="px-4 mb-4">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search programs..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary focus:bg-white transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
            </div>
            
            {/* Mobile Results */}
            {searchQuery && (
              <div className="mt-2 bg-white border border-gray-100 rounded-lg shadow-inner max-h-60 overflow-y-auto">
                {filteredPrograms.map(p => (
                  <div key={p._id} onClick={() => {navigate(`/public/programs/${p._id}`); setIsOpen(false);}} className="p-3 border-b border-gray-50 text-sm text-gray-700 flex items-center gap-2 active:bg-purple-50">
                    <span className="text-lg">📂</span> {p.title}
                  </div>
                ))}
                {filteredEvents.map(e => (
                  <div key={e._id} onClick={() => {navigate(`/public/events/${e._id}`); setIsOpen(false);}} className="p-3 border-b border-gray-50 text-sm text-gray-700 flex items-center gap-2 active:bg-purple-50">
                    <span className="text-lg">📅</span> {e.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1 px-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-primary font-medium">Home</Link>
            <Link to="/about" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-primary font-medium">About Us</Link>
            <Link to="/public/programs" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-primary font-medium">Programs</Link>
            <Link to="/public/events" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-primary font-medium">Events</Link>
            <Link to="/impact" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-primary font-medium">Impact</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-primary font-medium">Contact</Link>
          </div>
          
          <div className="border-t border-gray-100 mt-4 pt-4 px-4 flex flex-col gap-3">
            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-gray-700 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition">Log In</Link>
            <Link to="/join" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-white bg-primary rounded-xl font-bold hover:bg-purple-700 transition shadow-lg">Join Us</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
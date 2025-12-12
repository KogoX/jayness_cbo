import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import type { Program } from '../../types/program.types';
import type { CboEvent } from '../../types/event.types';

interface User {
  name: string;
  email: string;
  role?: string;
  image?: string;
}

const PublicNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // User State
  const [user, setUser] = useState<User | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [allEvents, setAllEvents] = useState<CboEvent[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Check if user is logged in and listen for changes
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Failed to parse user data');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
    
    // Listen for storage changes (e.g., logout in another tab)
    window.addEventListener('storage', checkUser);
    
    // Also check on location change (in case user logs in/out on same tab)
    const interval = setInterval(checkUser, 1000);
    
    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, [location]);

  // Load search data on mount or when search is focused (preload for better UX)
  useEffect(() => {
    if (allPrograms.length === 0 && allEvents.length === 0) {
      setSearchLoading(true);
      let isMounted = true;
      
      const loadSearchData = async () => {
        try {
          const [progRes, eventRes] = await Promise.all([
            apiClient.get('/programs'),
            apiClient.get('/events')
          ]);
          
          if (isMounted) {
            setAllPrograms(progRes.data);
            setAllEvents(eventRes.data);
          }
        } catch (error) {
          console.error("Search data load failed", error);
        } finally {
          if (isMounted) {
            setSearchLoading(false);
          }
        }
      };
      
      loadSearchData();
      
      return () => {
        isMounted = false;
      };
    }
  }, [allPrograms.length, allEvents.length]);

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

  // Advanced search algorithm with multi-field matching and relevance scoring
  const searchItems = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return { programs: [], events: [] };
    
    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(word => word.length > 0);
    
    // Search function with relevance scoring
    const calculateRelevance = (item: Program | CboEvent, query: string, queryWords: string[]): number => {
      let score = 0;
      const title = item.title.toLowerCase();
      const description = ('description' in item ? item.description : '').toLowerCase();
      const category = ('category' in item ? item.category : '').toLowerCase();
      const location = ('location' in item ? item.location : '').toLowerCase();
      
      // Exact title match (highest priority)
      if (title === query) score += 100;
      // Title starts with query
      else if (title.startsWith(query)) score += 50;
      // Title contains query
      else if (title.includes(query)) score += 30;
      
      // Word-by-word matching in title (for multi-word queries)
      queryWords.forEach(word => {
        if (title.includes(word)) score += 20;
        if (title.startsWith(word)) score += 10;
      });
      
      // Description matching
      if (description.includes(query)) score += 15;
      queryWords.forEach(word => {
        if (description.includes(word)) score += 5;
      });
      
      // Category matching (for events)
      if (category && category.includes(query)) score += 25;
      if (category && queryWords.some(word => category.includes(word))) score += 15;
      
      // Location matching (for events)
      if (location && location.includes(query)) score += 20;
      if (location && queryWords.some(word => location.includes(word))) score += 10;
      
      return score;
    };
    
    // Filter and score programs
    const programResults = allPrograms
      .map(program => ({
        item: program,
        score: calculateRelevance(program, query, queryWords)
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item)
      .slice(0, 5);
    
    // Filter and score events
    const eventResults = allEvents
      .map(event => ({
        item: event,
        score: calculateRelevance(event, query, queryWords)
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item)
      .slice(0, 5);
    
    return { programs: programResults, events: eventResults };
  }, [searchQuery, allPrograms, allEvents]);

  const filteredPrograms = searchItems.programs;
  const filteredEvents = searchItems.events;

  const hasResults = filteredPrograms.length > 0 || filteredEvents.length > 0;

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    setIsOpen(false);
  }, [navigate]);

  const isActive = (path: string) => location.pathname === path 
    ? 'text-primary font-bold bg-purple-50 px-3 py-1 rounded-full' 
    : 'text-gray-600 hover:text-primary hover:bg-gray-50 px-3 py-1 rounded-full transition-all';

  const handleResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setSearchQuery('');
  };

  // Helper function to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2 || !text) return text;
    
    try {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, index) => {
        // Check if this part matches the query (case-insensitive)
        if (part.toLowerCase() === query.toLowerCase()) {
          return (
            <mark key={index} className="bg-yellow-200 text-gray-900 font-medium px-0.5 rounded">
              {part}
            </mark>
          );
        }
        return <span key={index}>{part}</span>;
      });
    } catch (error) {
      // Fallback to plain text if regex fails
      return text;
    }
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
                placeholder="Search programs, events..."
                className="w-full bg-gray-100 text-gray-700 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white border border-transparent focus:border-primary/30 transition-all"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  // Show results immediately when typing (no debounce needed since we use useMemo)
                  setShowResults(value.length >= 2);
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) setShowResults(true);
                }}
                onBlur={() => {
                  // Delay hiding to allow click on results
                  setTimeout(() => setShowResults(false), 200);
                }}
              />
              <span className="absolute left-3.5 top-2.5 text-gray-400 group-focus-within:text-primary transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>

              {/* SEARCH RESULTS DROPDOWN */}
              {showResults && searchQuery.length >= 2 && (
                <div className="absolute top-14 left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden py-2 animate-fade-in-up ring-1 ring-black/5">
                  {searchLoading ? (
                    <div className="px-4 py-6 text-sm text-gray-500 text-center">
                      Loading...
                    </div>
                  ) : hasResults ? (
                    <>
                      {filteredPrograms.length > 0 && (
                        <div className="mb-2">
                          <h4 className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                            Programs ({filteredPrograms.length})
                          </h4>
                          {filteredPrograms.map(p => (
                            <button 
                              key={p._id}
                              onClick={() => handleResultClick(`/public/programs/${p._id}`)}
                              className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-start gap-3 transition group border-b border-gray-50 last:border-0"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 shadow-sm group-hover:shadow">
                                <img src={p.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
                                  {highlightMatch(p.title, searchQuery)}
                                </div>
                                {p.description && (
                                  <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {p.description.substring(0, 60)}...
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    p.status === 'Active' ? 'bg-green-100 text-green-700' :
                                    p.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {p.status}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {filteredEvents.length > 0 && (
                        <div>
                          <h4 className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                            Events ({filteredEvents.length})
                          </h4>
                          {filteredEvents.map(e => (
                            <button 
                              key={e._id}
                              onClick={() => handleResultClick(`/public/events/${e._id}`)}
                              className="w-full text-left px-4 py-3 hover:bg-purple-50 flex items-start gap-3 transition group border-b border-gray-50 last:border-0"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 text-center flex flex-col justify-center border border-gray-200 group-hover:border-primary/30">
                                <span className="text-[9px] font-bold text-primary uppercase">
                                  {new Date(e.date).toLocaleString('default', { month: 'short' })}
                                </span>
                                <span className="text-sm font-bold text-gray-800">
                                  {new Date(e.date).getDate()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
                                  {highlightMatch(e.title, searchQuery)}
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  {e.location && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      {e.location}
                                    </span>
                                  )}
                                  {e.category && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-primary font-bold">
                                      {e.category}
                                    </span>
                                  )}
                                </div>
                              </div>
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

            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/dashboard" 
                  className="text-sm font-semibold text-gray-600 hover:text-primary transition px-2"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/dashboard/profile" 
                  className="flex items-center gap-2 hover:bg-gray-50 p-1.5 pr-3 rounded-full border border-transparent hover:border-gray-100 transition"
                >
                  <div className="h-8 w-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden border border-gray-100">
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-gray-600 hover:text-red-600 transition px-2"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-primary transition px-2">
                  Log In
                </Link>
                <Link to="/join" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-purple-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 transform active:scale-95 flex items-center gap-1">
                  <span>Join Us</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            )}
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
                placeholder="Search programs, events..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary focus:bg-white transition"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                }}
              />
              <span className="absolute left-3 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
            
            {/* Mobile Results */}
            {searchQuery.length >= 2 && (
              <div className="mt-2 bg-white border border-gray-100 rounded-lg shadow-inner max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                ) : (
                  <>
                    {filteredPrograms.length > 0 && (
                      <div className="sticky top-0 bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b">
                        Programs ({filteredPrograms.length})
                      </div>
                    )}
                    {filteredPrograms.map(p => (
                      <div 
                        key={p._id} 
                        onClick={() => {
                          navigate(`/public/programs/${p._id}`); 
                          setIsOpen(false);
                          setSearchQuery('');
                        }} 
                        className="p-3 border-b border-gray-50 text-sm text-gray-700 active:bg-purple-50 flex items-start gap-3"
                      >
                        <span className="text-lg shrink-0">📂</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800">{highlightMatch(p.title, searchQuery)}</div>
                          {p.description && (
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description.substring(0, 50)}...</div>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredEvents.length > 0 && (
                      <div className="sticky top-0 bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-t">
                        Events ({filteredEvents.length})
                      </div>
                    )}
                    {filteredEvents.map(e => (
                      <div 
                        key={e._id} 
                        onClick={() => {
                          navigate(`/public/events/${e._id}`); 
                          setIsOpen(false);
                          setSearchQuery('');
                        }} 
                        className="p-3 border-b border-gray-50 text-sm text-gray-700 active:bg-purple-50 flex items-start gap-3"
                      >
                        <span className="text-lg shrink-0">📅</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800">{highlightMatch(e.title, searchQuery)}</div>
                          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                            {e.location && <span>{e.location}</span>}
                            {e.category && <span className="text-primary">• {e.category}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!hasResults && searchQuery.length >= 2 && (
                      <div className="p-4 text-center text-sm text-gray-500 italic">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </>
                )}
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
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-gray-700 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition">
                  Dashboard
                </Link>
                <Link to="/dashboard/profile" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-primary bg-purple-50 rounded-xl font-bold hover:bg-purple-100 transition">
                  {user.name}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-3 text-white bg-red-600 rounded-xl font-bold hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-gray-700 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition">Log In</Link>
                <Link to="/join" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-white bg-primary rounded-xl font-bold hover:bg-purple-700 transition shadow-lg">Join Us</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default memo(PublicNavbar);
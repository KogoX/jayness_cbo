import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../../api/axiosClient';
import type { Program } from '../../types/program.types';
import type { CboEvent } from '../../types/event.types';
import { AUTH_CHANGED_EVENT, notifyAuthChanged } from '../../utils/authEvents';
import AuthModal from '../common/AuthModal';

interface User {
  name: string;
  email: string;
  role?: string;
  image?: string;
}

const PublicNavbar: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authAnchorEl, setAuthAnchorEl] = useState<HTMLElement | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [allEvents, setAllEvents] = useState<CboEvent[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasLoadedSearchData, setHasLoadedSearchData] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const loginButtonRef = useRef<HTMLButtonElement>(null);

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
    window.addEventListener('storage', checkUser);
    window.addEventListener(AUTH_CHANGED_EVENT, checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener(AUTH_CHANGED_EVENT, checkUser);
    };
  }, []);

  useEffect(() => {
    const shouldLoadSearchData = (showResults || searchQuery.length >= 2) && !hasLoadedSearchData;

    if (shouldLoadSearchData) {
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
            setHasLoadedSearchData(true);
          }
        } catch (error) {
          console.error('Search data load failed', error);
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
  }, [showResults, searchQuery, hasLoadedSearchData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchItems = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return { programs: [], events: [] };

    const query = searchQuery.toLowerCase().trim();
    const queryWords = query.split(/\s+/).filter(word => word.length > 0);

    const calculateRelevance = (item: Program | CboEvent, q: string, words: string[]): number => {
      let score = 0;
      const title = item.title.toLowerCase();
      const description = ('description' in item ? item.description : '').toLowerCase();
      const category = ('category' in item ? item.category : '').toLowerCase();
      const itemLocation = ('location' in item ? item.location : '').toLowerCase();

      if (title === q) score += 100;
      else if (title.startsWith(q)) score += 50;
      else if (title.includes(q)) score += 30;

      words.forEach(word => {
        if (title.includes(word)) score += 20;
        if (title.startsWith(word)) score += 10;
      });

      if (description.includes(q)) score += 15;
      words.forEach(word => {
        if (description.includes(word)) score += 5;
      });

      if (category && category.includes(q)) score += 25;
      if (category && words.some(word => category.includes(word))) score += 15;

      if (itemLocation && itemLocation.includes(q)) score += 20;
      if (itemLocation && words.some(word => itemLocation.includes(word))) score += 10;

      return score;
    };

    const programResults = allPrograms
      .map(program => ({ item: program, score: calculateRelevance(program, query, queryWords) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item)
      .slice(0, 5);

    const eventResults = allEvents
      .map(event => ({ item: event, score: calculateRelevance(event, query, queryWords) }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(result => result.item)
      .slice(0, 5);

    return { programs: programResults, events: eventResults };
  }, [searchQuery, allPrograms, allEvents]);

  const filteredPrograms = searchItems.programs;
  const filteredEvents = searchItems.events;
  const hasResults = filteredPrograms.length > 0 || filteredEvents.length > 0;

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    notifyAuthChanged();
    setShowProfileMenu(false);
    setUser(null);
    navigate('/');
  }, [navigate]);

  const isActive = (path: string) => location.pathname === path
    ? 'text-primary font-bold bg-purple-50 px-3 py-1 rounded-full whitespace-nowrap'
    : 'text-gray-600 hover:text-primary hover:bg-gray-50 px-3 py-1 rounded-full transition-all whitespace-nowrap';

  const handleResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setShowSearchPanel(false);
    setSearchQuery('');
  };

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin', anchorEl: HTMLElement | null = null) => {
    setAuthMode(mode);
    setAuthAnchorEl(anchorEl);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authParam = params.get('auth');
    if (!user && (authParam === 'signin' || authParam === 'signup')) {
      openAuthModal(authParam, loginButtonRef.current);
      params.delete('auth');
      navigate(
        {
          pathname: location.pathname,
          search: params.toString() ? `?${params.toString()}` : '',
        },
        { replace: true }
      );
    }
  }, [location.pathname, location.search, navigate, user]);

  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2 || !text) return text;

    try {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = text.split(regex);

      return parts.map((part, index) => {
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
      return text;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-3">
          <div className="flex items-center shrink-0">
            <Link to="/" className="text-2xl font-extrabold text-primary flex items-center gap-2 tracking-tight group">
              <img src="/logo.svg" alt="Logo" className="h-10 w-auto group-hover:scale-105 transition-transform" />
              <span className="hidden sm:block">Jayness Foundation</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowSearchPanel((prev) => !prev);
                if (searchQuery.length >= 2) setShowResults(true);
              }}
              className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-primary/40 flex items-center justify-center transition"
              aria-label="Toggle search"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button
              ref={loginButtonRef}
              type="button"
              onClick={() => {
                if (user) {
                  navigate('/dashboard');
                } else {
                  openAuthModal('signin', loginButtonRef.current);
                }
              }}
              className="px-3 sm:px-4 h-10 rounded-full bg-primary text-white text-sm font-semibold hover:bg-purple-700 transition"
            >
              Dashboard
            </button>

            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    setShowProfileMenu((prev) => !prev);
                    return;
                  }
                  openAuthModal('signin', loginButtonRef.current);
                }}
                className="h-10 w-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-primary/40 flex items-center justify-center transition overflow-hidden"
                aria-label="Profile"
              >
                {user?.image ? (
                  <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-7 2-7 5v1h14v-1c0-3-3-5-7-5z" />
                  </svg>
                )}
              </button>

              {showProfileMenu && user && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden z-50">
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Update Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showSearchPanel && (
          <div className="pb-4" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search programs, events..."
                className="w-full bg-gray-100 text-gray-700 rounded-full py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white border border-transparent focus:border-primary/30 transition-all"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  setShowResults(value.length >= 2);
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) setShowResults(true);
                }}
              />
              <span className="absolute left-4 top-3.5 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>

            {showResults && searchQuery.length >= 2 && (
              <div className="mt-3 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden py-2 animate-fade-in-up ring-1 ring-black/5">
                {searchLoading ? (
                  <div className="px-4 py-6 text-sm text-gray-500 text-center">Loading...</div>
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
                              <span className="text-sm font-bold text-gray-800">{new Date(e.date).getDate()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">
                                {highlightMatch(e.title, searchQuery)}
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
        )}

        <div className="border-t border-gray-100 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/about" className={isActive('/about')}>About</Link>
            <Link to="/public/programs" className={isActive('/public/programs')}>Programs</Link>
            <Link to="/public/events" className={isActive('/public/events')}>Events</Link>
            <Link to="/impact" className={isActive('/impact')}>Impact</Link>
            <Link to="/contact" className={isActive('/contact')}>Contact</Link>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        anchorEl={authAnchorEl}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthAnchorEl(null);
        }}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setAuthAnchorEl(null);
          navigate('/dashboard');
        }}
      />
    </nav>
  );
};

export default memo(PublicNavbar);

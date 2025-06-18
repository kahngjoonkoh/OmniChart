import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, updateLoginStatus } from '../client/Auth';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { addRecentStockQuery, getRecentStockQueries } from '../utils/RecentStocks';
import { useAlert } from './AlertBox';

const Header = ({ initialQuery = "" }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [loginStatus, setLoginStatus] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef();
  const { addAlert } = useAlert();
  const [username, setUsername] = useState(null);

  useEffect(() => {
    updateLoginStatus(setLoginStatus, setUsername);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      updateLoginStatus(setLoginStatus, setUsername);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setRecentQueries(getRecentStockQueries());
  }, []);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed !== "") {
      addRecentStockQuery(trimmed);
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setShowDropdown(false);
    }
  };

  const handleSelectRecent = (q) => {
    setQuery(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setShowDropdown(false);
  };

  const logoutHandler = () => {
    try {
      supabase.auth.signOut().then((err) => {
        if (err?.error) {
          console.log(err);
          setLoginStatus(false);
          supabase.auth.setSession(null);
        }
        navigate('/');
        addAlert("Successfully logged out", "success");
      });
    } catch (err) {
      addAlert("Failed to sign out", "error");
    }
  };

  return (
    <header className="w-full bg-white shadow px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Brand Name */}
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-blue-600 cursor-pointer"
        >
          OmniChart
        </h1>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            ref={inputRef}
            placeholder="Search stocks (e.g. AAPL or Apple)"
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>

          {/* Dropdown */}
          {showDropdown && recentQueries.length > 0 && (
            <ul className="absolute bg-white border border-gray-200 rounded-md shadow-md mt-1 w-full z-20">
              {recentQueries.map((q, idx) => (
                <li
                  key={idx}
                  onMouseDown={() => handleSelectRecent(q)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {q}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-4 items-center ml-auto">
          {loginStatus !== null && loginStatus ? (
            <>
              <span className="text-gray-700 font-medium">
                Hi, {username}
              </span>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Watchlist
              </button>
              <button
                onClick={logoutHandler}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
              >
                Sign up
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

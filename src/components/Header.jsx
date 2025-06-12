import { useNavigate } from 'react-router-dom';
import { supabase, isLoggedIn } from '../client/Auth';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'; // Make sure heroicons is installed
import { useState, useEffect } from 'react';

const Header = ({ initialQuery = "" }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [loginStatus, setLoginStatus] = useState(null);

  useEffect(() => {
    // Retrieve login status
    const updateLoginStatus = async () => {
      const state = await isLoggedIn();
      setLoginStatus(state);
    };
    updateLoginStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      updateLoginStatus();
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleSearch = () => {
    if (query.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const logoutHandler = () => {
    supabase.auth.signOut().then(() => navigate('/'));
  }

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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search stocks (e.g. AAPL or Apple)"
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-2 ml-auto">
          {loginStatus !== null && (loginStatus ? (
            <button
              onClick={logoutHandler}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Log out
            </button>
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
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;

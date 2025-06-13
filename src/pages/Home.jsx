import { useState, useEffect } from 'react';
import { getAccessToken, isLoggedIn, supabase } from '../client/Auth';

const baseUrl = import.meta.env.VITE_API_URL;

const Home = () => {
  const [watchlist, setWatchlist] = useState(null);
  const [loginStatus, setLoginStatus] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const state = await isLoggedIn();
      setLoginStatus(state);

      if (!state) return;

      const token = await getAccessToken();
      const resp = await fetch(`${baseUrl}/watchlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!resp.ok) {
        console.error(`Failed to fetch user's watchlist`);
        return;
      }

      const data = await resp.json();
      setWatchlist(data.tickers);
    }

    fetchData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="flex items-center justify-center md:pt-[10%] bg-white px-6">
      {loginStatus === false && (
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-4">
            Welcome to OmniChart
          </h1>
          <p className="text-gray-600 text-lg md:text-xl">
            Explore and analyze stock market data with ease.
          </p>
        </div>
      )}

      {loginStatus && watchlist?.length > 0 && (
        <section className="mb-6 w-full max-w-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-2">My Watchlist</h3>
          <ul className="divide-y divide-gray-200 border border-gray-100 rounded-md shadow-sm">
            {watchlist.map((ticker) => (
              <li key={ticker}>
                <a
                  href={`/stocks/${ticker}`}
                  className="block px-4 py-3 hover:bg-blue-50 transition"
                >
                  <div className="font-medium text-blue-700">{ticker}</div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
};

export default Home;

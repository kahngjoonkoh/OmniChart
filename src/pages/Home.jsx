import { useState, useEffect } from 'react';
import { useAuth, supabase } from '../context/AuthContext';

const baseUrl = import.meta.env.VITE_API_URL;

const Home = () => {
  const auth = useAuth();
  const [watchlist, setWatchlist] = useState(null);

  useEffect(() => {
    async function fetchWatchlist() {
      if (auth.loading || !auth.token) {
        return;
      }
      const resp = await fetch(`${baseUrl}/watchlist`,
        { headers: { 'Authorization': `Bearer ${auth.token}` } }
      );
      if (!resp.ok) {
        console.error(`Failed to fetch user's watchlist1`);
        return;
      }
      const data = await resp.json();
      console.log(data);
      try {
        setWatchlist(data.tickers);
      } catch (err) {
        console.error("Failed to fetch user's watchlist");
      }
    }
    fetchWatchlist();
  }, [auth.session]);

  return (
    <main className="flex items-center justify-center min-h-[80vh] bg-white px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-4">
          Welcome to OmniChart
        </h1>
        <p className="text-gray-600 text-lg md:text-xl">
          Explore and analyze stock market data with ease.
        </p>
      </div>

      {/* Watchlist */}
      {(auth.isLoggedIn() && watchlist?.length > 0) && (
        <section className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">My Watchlist</h3>
          <ul className="divide-y divide-gray-200 border border-gray-100 rounded-md shadow-sm">
            {watchlist?.map((ticker) => (
              <li key={ticker}>
                <a
                  href={`/stocks/${ticker}`}
                  className="block px-4 py-3 hover:bg-blue-50 transition"
                >
                  <div className="font-medium text-blue-700">{ticker}</div>
                  <div className="text-sm text-gray-500">{ticker}</div>
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

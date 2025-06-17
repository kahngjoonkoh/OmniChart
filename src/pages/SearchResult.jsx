import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useAlert } from '../components/AlertBox';

const baseUrl = import.meta.env.VITE_API_URL;

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResult = () => {
  const query = decodeURIComponent(useQuery().get("q") || "");
  const [tickers, setTickers] = useState([]);
  const [events, setEvents] = useState([]); // future-proof
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addAlert } = useAlert();

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);

    fetch(`${baseUrl}/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) {
          // addAlert("No matching tickers found. Please check your query and try again.", "error");
          throw new Error("No matching tickers found. Please check your query and try again.");
        };
        return res.json();
      })
      .then((data) => {
        setTickers(data.stocks || []);
        setEvents(data.events || []); // optional, future
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  const noResults = !loading && !error && tickers.length === 0 && events.length === 0;

  return (
    <>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">
          Search Results for "<span className="italic">{query}</span>"
        </h2>

        {loading && <p className="text-gray-500">Loading results...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {noResults && (
          <p className="text-gray-500 italic">No results found for "{query}".</p>
        )}

        {/* Stocks */}
        {tickers.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Stocks</h3>
            <ul className="divide-y divide-gray-200 border border-gray-100 rounded-md shadow-sm">
              {tickers.map((ticker) => (
                <li key={ticker.ticker}>
                  <a
                    href={`/stocks/${ticker.ticker}`}
                    className="block px-4 py-3 hover:bg-blue-50 transition"
                  >
                    <div className="font-medium text-blue-700">{ticker.name}</div>
                    <div className="text-sm text-gray-500">{ticker.ticker}</div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Events (future-proof) */}
        {events.length > 0 && (
          <section className="mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Events</h3>
            <ul className="divide-y divide-gray-200 border border-gray-100 rounded-md shadow-sm">
              {events.map((event, index) => (
                <li key={index} className="px-4 py-3">
                  <div className="text-blue-700 font-medium">{event.title}</div>
                  <div className="text-sm text-gray-500">{event.description}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
};

export default SearchResult;

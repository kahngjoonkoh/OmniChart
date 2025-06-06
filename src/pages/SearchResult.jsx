import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';

const baseUrl = import.meta.env.VITE_API_URL;

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResult = () => {
  const query = decodeURIComponent(useQuery().get("q") || "");
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);

    fetch(`${baseUrl}/search?q=${encodeURIComponent(query)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setTickers(data.stocks || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <>
      <Header initialQuery={query} />
      <div>
        {loading && <p>Loading results for "{query}"...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {!loading && tickers.length === 0 && <p>No results found for "{query}".</p>}
        <ul>
          {tickers.map((ticker) => (
            <li key={ticker.ticker}>
              <a href={`/stocks/${ticker.ticker}`}>
                {ticker.name} ({ticker.ticker})
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default SearchResult;

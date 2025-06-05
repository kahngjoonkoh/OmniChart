import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ initialQuery = "" }) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  const search = (e) => {
    if (query !== initialQuery && query !== "") {
      navigate("/search?q=" + query)
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search Ticker (e.g., AAPL, NVDA)"
         className="w-full border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            search();
        }}
      />
      <button onClick={search}>
        <FaSearch />
      </button>
    </div>
  )
}

export default SearchBar;

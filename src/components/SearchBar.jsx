import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

function SearchBar(q = '') {
  const [query, setQuery] = useState(q);
  const navigate = useNavigate();

  const search = (e) => {
    if (query != q && query != '') {
      navigate("/search")
    }
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search ..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            search();
        }}
      />
    </div>
  )
}
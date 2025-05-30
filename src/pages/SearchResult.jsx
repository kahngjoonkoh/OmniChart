import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'

const useQuery = () => new URLSearchParams(useLocation().search)

const SearchResult = () => {
  const query = decodeURIComponent(useQuery().get("q"));
  const tickers = [
    { name: 'NVIDIA Corporation', symbol: 'NVDA' },
    { name: 'Taiwan Semiconductor Manufacturing Company Limited', symbol: 'TSM' },
    { name: 'VanEck Semiconductor ETF', symbol: 'SMH' }
  ];
  const tickerComponents = tickers.map(ticker =>
    <li key={ticker.symbol}>
      <div>
        <a href={"/stocks/" + ticker.symbol}>
          {ticker.name + ' (' + ticker.symbol + ')'}
        </a>
      </div>
    </li>
  );

  return (
    <>
      <Header isLoggedIn={false} initialQuery={query} />
      <div>
        <ul>{tickerComponents}</ul>
      </div>
    </>
  )
}

export default SearchResult;

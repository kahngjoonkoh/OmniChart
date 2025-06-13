// below is version that uses database:
import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import SegmentHighlighter from '../components/SegmentHighlight';
import NewsPanel from '../components/NewsPanel';
import { data, useParams } from 'react-router-dom';
import axios from 'axios';
import InfoTooltip from '../components/InfoTooltip';
import {
  BookmarkIcon as BookmarkOutlineIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/outline'; // Outline for + icon

import { BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid';

import { getAccessToken } from '../client/Auth';

const baseUrl = import.meta.env.VITE_API_URL;

const generateStockData = async (ticker) => {
  if (!ticker) {
    console.error("Error: Ticker symbol is undefined or empty. Cannot fetch stock data.");
    return []; // Return an empty array immediately
  }
  try {
    console.log("Fetching Stock data")
    console.log(ticker)
    const response = await fetch(`${baseUrl}/bars/${ticker}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.status} ${response.statusText}`);
    }
    const apiData = await response.json();

    const formattedData = apiData.map(bar => ({
      date: new Date(bar.t).toISOString().slice(0, 10),
      price: parseFloat(bar.c.toFixed(2)),
    }));
    console.log(formattedData)
    // // Format the fetched data for Lightweight Charts Candlestick Series
    // // Expected format: { time: Unix timestamp in seconds, open: ..., high: ..., low: ..., close: ... }
    // const formattedData = apiData.map(bar => ({
    //   time: new Date(bar.t).getTime() / 1000, // Convert ISO string ('t') to Unix timestamp (seconds)
    //   open: parseFloat(bar.o),   // 'o' for open
    //   high: parseFloat(bar.h),   // 'h' for high
    //   low: parseFloat(bar.l),     // 'l' for low
    //   close: parseFloat(bar.c), // 'c' for close
    // }));

    return formattedData;
  } catch (error) {
    console.error('Error in generateStockData:', error);
    return []; // Return an empty array on error to prevent chart issues
  }
};

export default function ChartDisplay() {
  const { ticker } = useParams();
  console.log("Displaying Chart")
  console.log(ticker)
  const [stockData, setStockData] = useState([]);
  const [stockName, setStockName] = useState([])
  const [segments, setSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState(null);

  // for getting beta/risk level
  const [beta, setBeta] = useState(null);
  const [riskCategory, setRiskCategory] = useState('');

  useEffect(() => {
    async function fetchStockData() {
      console.log("Fetching stock data for ticker:", ticker);
      const data = await generateStockData(ticker);
      setStockData(data);
    }

    if (ticker) { // Only fetch if ticker is available
      fetchStockData();
    }
  }, [ticker]);

  useEffect(() => {
    async function fetchStockName() {
      const res = await axios.get(`${baseUrl}/search?q=${ticker}`);
      const data = res.data
      setStockName(data.stocks[0].name)
    }
    if (ticker) {
      fetchStockName();
    }
  }, [ticker])

  useEffect(() => {
    async function fetchTickerEvents() {
      try {
        const res = await axios.get(`${baseUrl}/events/${ticker}`);
        const events = res.data;

        console.log('Fetched ticker_events:', events);

        // Fetch associated events for each ticker_event
        const enrichedSegments = await Promise.all(events.map(async (event) => {
          try {
            return {
              id: event.id,
              startIndex: event.start_index,
              endIndex: event.end_index,
              title: event.events.title,
              news: event.events.content,
              source_url: event.events.source_url
            };
          } catch (innerErr) {
            console.error(`Failed to fetch event ${event.event_id}:`, innerErr);
            return {
              id: event.id,
              startIndex: event.start_index,
              endIndex: event.end_index,
              title: "Untitled",
              news: [],
              source_url: "None"
            };
          }
        }));

        setSegments(enrichedSegments);


        if (segments.length > 0) {
          setSelectedSegmentId(enrichedSegments[0].id);
        }
      } catch (err) {
        console.error("Error fetching ticker events", err);
      }
    }
    if (ticker) {
      fetchTickerEvents();
    }
  }, [ticker]);

  useEffect(() => {
    async function fetchBetaAndRisk() {
      try {
        const res = await axios.get(`${baseUrl}/beta/${ticker}`);
        setBeta(res.data.beta);
        setRiskCategory(res.data.riskCategory);
      } catch (err) {
        console.error("Failed to fetch beta and risk category", err);
      }
    }

    if (ticker) {
      fetchBetaAndRisk();
    }
  }, [ticker]);

  useEffect(() => {
    // Check whether current ticker is in user's watchlist
    async function fetchTickerInWatchlist() {
      const token = await getAccessToken();
      if (!token) {
        return;
      }
      const resp = await fetch(`${baseUrl}/watchlist/${ticker}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      if (!resp.ok) {
        const data = await resp.json();
        console.log(data);
        console.error("Failed to fetch user watchlist");
        return;
      }
      const { in: inWatchlist } = await resp.json();
      setInWatchlist(inWatchlist);
    }
    fetchTickerInWatchlist();
  }, [])

  // Add current ticker to watchlist
  // It should be assumed that the ticker is not in watchlist before
  const addTickerToWatchlist = async () => {
    const token = await getAccessToken();
    if (!token) {
      return;
    }
    const resp = await fetch(`${baseUrl}/watchlist/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ticker: ticker })
    })

    if (!resp.ok) {
      console.error(`Failed to add ${ticker} to watchlist`);
      return;
    }
    setInWatchlist(true);
  };

  // Remove current ticker from watchlist
  // It should be assumed that the ticker is in watchlist before
  const removeTickerFromWatchlist = async () => {
    const token = await getAccessToken();
    if (!token) {
      return;
    }
    const resp = await fetch(`${baseUrl}/watchlist/remove`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ticker: ticker })
    })

    if (!resp.ok) {
      console.error(`Failed to remove ${ticker} from watchlist`);
      return;
    }
    setInWatchlist(false);
  }

  const activeSegmentId = selectedSegmentId ?? hoveredSegmentId;
  const selectedSegment = segments.find((seg) => seg.id === activeSegmentId);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ flex: 3, padding: 20 }}>
        <h2 className="text-xl font-bold">{ticker ? `${stockName} (${ticker.toUpperCase()})` : 'Loading...'}
          {inWatchlist !== null && (
            inWatchlist ? (
              <button onClick={removeTickerFromWatchlist} className="text-xl text-blue-600 hover:text-blue-800">
                <BookmarkFilledIcon className="w-6 h-6 stroke-[2] mx-1 p-1 items-center rounded hover:bg-gray-100 transition" />
              </button>
            ) : (
              <button onClick={addTickerToWatchlist} className="text-gray-400 hover:text-blue-600">
                <BookmarkOutlineIcon className="w-6 h-6 stroke-[2] mx-1 p-1 items-center rounded hover:bg-gray-100 transition" />
              </button>
            )
          )}
        </h2>
        {beta !== null && (
          <p style={{ fontSize: '1rem', color: '#444', lineHeight: '1.6' }}>
            <strong>
              Risk Classification
              <InfoTooltip text={`This classification is derived from the beta value (${beta.toFixed(2)}):

< 0: Inverse Market Risk
0: No Market Risk
0–1: Low Risk
1: Average Risk
1–2: High Risk
> 2: Very High Risk

Beta measures a stock's volatility compared to the market`} />
              :
            </strong>{' '}
            {riskCategory}
          </p>
        )}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={stockData}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="date" minTickGap={30} />
            <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#007bff" strokeWidth={2} dot={false} />
            {segments.map((segment) =>
              SegmentHighlighter(
                segment,
                stockData,
                selectedSegmentId === segment.id,
                setSelectedSegmentId,
                hoveredSegmentId === segment.id,
                setHoveredSegmentId
              )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <NewsPanel {...selectedSegment} />
    </div>
  );
}

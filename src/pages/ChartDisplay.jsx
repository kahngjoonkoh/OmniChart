// below is version that uses database:
import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Brush
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

const toISOStringDateOnly = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const iso = d.toISOString(); // e.g. 2020-06-13T00:00:00.000Z
  return iso.replace('.000Z', 'Z'); // returns 2020-06-13T00:00:00Z
};

const generateStockData = async (ticker, startDate, endDate) => {
  if (!ticker) {
    console.error("Error: Ticker symbol is undefined or empty.");
    return [];
  }

  try {
    const queryParams = new URLSearchParams({
      start: toISOStringDateOnly(startDate),
      end: toISOStringDateOnly(endDate)
    });

    const url = `${baseUrl}/bars/${ticker}?${queryParams}`;
    console.log(url);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.status}`);
    }

    const apiData = await response.json();

    return apiData.map(bar => ({
      date: new Date(bar.t).toISOString().slice(0, 10),
      price: parseFloat(bar.c.toFixed(2)),
    }));
  } catch (error) {
    console.error('Error in generateStockData:', error);
    return [];
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

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    console.log("Fetching stock data for range:", {
    ticker,
    start: startDate.toISOString(),
    end: endDate.toISOString()
    });

    async function fetchStockData() {
      if (ticker && startDate && endDate) {
        const data = await generateStockData(ticker, startDate, endDate);
        setStockData(data);
      }
    }
    fetchStockData();
  }, [ticker, startDate, endDate]);

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

  useEffect(() => {
    const preventZoom = (e) => {
      if (
        (e.ctrlKey || e.metaKey) && (e.deltaY !== 0 || e.deltaX !== 0)
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventZoom, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventZoom);
    };
  }, []);

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

  // inside your component (ChartDisplay)
  const chartRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(null);

  const handleZoom = (e) => {
    e.preventDefault();
    const zoomFactor = 1.2;
    const direction = e.deltaY > 0 ? 1 : -1;

    const diff = endDate - startDate;
    const newDiff = direction > 0 ? diff * zoomFactor : diff / zoomFactor;

    const center = new Date((startDate.getTime() + endDate.getTime()) / 2);
    const newStart = new Date(center.getTime() - newDiff / 2);
    const newEnd = new Date(center.getTime() + newDiff / 2);

    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !stockData.length) return;

    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = e.clientX;

    const chartWidth = chartRef.current?.offsetWidth || 800; // fallback
    const timePerPixel = (endDate - startDate) / chartWidth;

    const deltaTime = -deltaX * timePerPixel;

    const newStart = new Date(startDate.getTime() + deltaTime);
    const newEnd = new Date(endDate.getTime() + deltaTime);

    setStartDate(newStart);
    setEndDate(newEnd);
  };

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
        <div className="flex items-center gap-4 mt-4 mb-2">
          <label htmlFor="range-select" className="text-sm text-gray-600 font-medium">
            View Range:
          </label>
          <select
            id="range-select"
            className="border border-gray-300 rounded-md px-3 py-1 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            onChange={(e) => {
              const value = e.target.value;
              const now = new Date();         // Create a single consistent "now"
              const newStart = new Date(now); // Clone it

              if (value.endsWith('Y')) {
                const years = parseInt(value);
                newStart.setFullYear(now.getFullYear() - years);
              } else {
                const months = parseInt(value);
                newStart.setMonth(now.getMonth() - months);
              }

              setStartDate(newStart);
              setEndDate(now); // Use same `now` instead of new Date()
            }}
            defaultValue="3"
          >
            <option value="1">1 Month</option>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">1 Year</option>
            <option value="24">2 Years</option>
            <option value="36">3 Years</option>
            <option value="48">4 Years</option>
            <option value="60">5 Years</option>
          </select>
        </div>
          <div
            ref={chartRef}
            onWheel={handleZoom}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ cursor: isDragging.current ? 'grabbing' : 'grab' }}
          >
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
      </div>

      <NewsPanel {...selectedSegment} />
    </div>
  );
}

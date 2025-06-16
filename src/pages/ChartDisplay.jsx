import { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine
} from 'recharts';
import SegmentHighlighter from '../components/SegmentHighlight';
import NewsPanel from '../components/NewsPanel';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import InfoTooltip from '../components/InfoTooltip';
import {
  BookmarkIcon as BookmarkOutlineIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid';
import { getAccessToken } from '../client/Auth';
import { useAlert } from '../components/AlertBox';

const baseUrl = import.meta.env.VITE_API_URL;

const toISOStringDateOnly = (date) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const iso = d.toISOString();
  return iso.replace('.000Z', 'Z');
};

const generateStockData = async (ticker, startDate, endDate) => {
  if (!ticker) {
    addAlert("Ticker symbol is undefined or empty");
    // console.error("Error: Ticker symbol is undefined or empty.");
    return [];
  }

  try {
    const queryParams = new URLSearchParams({
      start: toISOStringDateOnly(startDate),
      end: toISOStringDateOnly(endDate)
    });

    const url = `${baseUrl}/bars/${ticker}?${queryParams}`;
    let response;
    try {
      response = await fetch(url);
    } catch (err) {
      addAlert("Failed to fetch stock data", "error");
      return [];
    }
    if (!response.ok) {
      addAlert("Failed to fetch stock data", "error");
      return [];
      // throw new Error(`Failed to fetch stock data: ${response.status}`);
    }

    const apiData = await response.json();
    return apiData.map(bar => ({
      date: new Date(bar.t).toISOString().slice(0, 10),
      timestamp: new Date(bar.t),
      price: parseFloat(bar.c.toFixed(2)),
    }));
  } catch (error) {
    addAlert("Failed to generate stock data", "error");
    // console.error('Error in generateStockData:', error);
    return [];
  }
};

export default function ChartDisplay() {
  const { ticker } = useParams();
  const [fullStockData, setFullStockData] = useState([]);
  const [stockName, setStockName] = useState([]);
  const [segments, setSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState(null);
  const [beta, setBeta] = useState(null);
  const [riskCategory, setRiskCategory] = useState('');
  const { addAlert } = useAlert();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    now.setMonth(now.getMonth() - 3);
    return now;
  });

  // subtracting 15.05m to prevent {"details":"subscription does not permit querying recent SIP data (HTTP 403)","error":"Error fetching historical bars"}
  const [endDate, setEndDate] = useState(new Date(Date.now() - 15.05 * 60 * 1000));


  const [minFetchedDate, setMinFetchedDate] = useState(null);
  const [maxFetchedDate, setMaxFetchedDate] = useState(null);
  const [hoverY, setHoverY] = useState(null);

  const chartRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(null);

  const visibleStockData = fullStockData.filter(d => {
    return d.timestamp >= startDate && d.timestamp <= endDate;
  });

  useEffect(() => {
    async function fetchStockData() {
      if (ticker) {
        const now = new Date();
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(now.getFullYear() - 5);

        const data = await generateStockData(ticker, fiveYearsAgo, now);
        setFullStockData(data);
        setMinFetchedDate(fiveYearsAgo);
        setMaxFetchedDate(now);
      }
    }
    fetchStockData();
  }, [ticker]);

  useEffect(() => {
    async function fetchStockName() {
      try {
        const res = await axios.get(`${baseUrl}/search?q=${ticker}`);
        const data = res.data;
        setStockName(data.stocks[0].name);
      } catch (err) {
        addAlert("Failed to fetch stock name", "error");
      }
    }
    if (ticker) {
      fetchStockName();
    }
  }, [ticker]);

  useEffect(() => {
    async function fetchTickerEvents() {
      try {
        const res = await axios.get(`${baseUrl}/events/${ticker}`);
        const events = res.data;
        const enrichedSegments = await Promise.all(events.map(async (event) => {
          return {
            id: event.id,
            timestamp: event.events.timestamp,
            startIndex: event.start_index,
            endIndex: event.end_index,
            title: event.events.title,
            news: event.events.content,
            source_url: event.events.source_url
          };
        }));
        setSegments(enrichedSegments);
        if (enrichedSegments.length > 0) {
          setSelectedSegmentId(enrichedSegments[0].id);
        }
      } catch (err) {
        addAlert("Failed to fetch ticker events", "error");
        return;
        // console.error("Error fetching ticker events", err);
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
        addAlert("Failed to fetch beta and risk category", "error");
        return;
        // console.error("Failed to fetch beta and risk category", err);
      }
    }
    if (ticker) {
      fetchBetaAndRisk();
    }
  }, [ticker]);

  useEffect(() => {
    async function fetchTickerInWatchlist() {
      const token = await getAccessToken();
      if (!token) {
        navigate('/login');
        return;
      }
      let resp;
      try {
        resp = await fetch(`${baseUrl}/watchlist/${ticker}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        )
      } catch (err) {
        addAlert("Failed to fetch watchlist", "error");
        return;
      }
      if (!resp.ok) {
        addAlert("Failed to fetch watchlist", "error");
        // console.error("Failed to fetch user watchlist");
        return;
      }
      const { in: inWatchlist } = await resp.json();
      setInWatchlist(inWatchlist);
    }
    fetchTickerInWatchlist();
  }, []);

  // useEffect(() => {
  //   const preventZoom = (e) => {
  //     if ((e.ctrlKey || e.metaKey) && (e.deltaY !== 0 || e.deltaX !== 0)) {
  //       e.preventDefault();
  //     }
  //   };
  //   window.addEventListener('wheel', preventZoom, { passive: false });
  //   return () => window.removeEventListener('wheel', preventZoom);
  // }, []);
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {
      addAlert("Cannot fetch chart", "error");
      return;
    };

    // Override passive wheel listener
    const handleWheel = (e) => {
      e.preventDefault(); // allow zoom
      handleZoom(e);
    };

    chart.addEventListener('wheel', handleWheel, { passive: false });
    return () => chart.removeEventListener('wheel', handleWheel);
  }, [startDate, endDate]);


  const addTickerToWatchlist = async () => {
    const token = await getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    }
    let resp;
    try {
      resp = await fetch(`${baseUrl}/watchlist/add`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ticker })
      });
    } catch (err) {
      addAlert("Failed to add ticker to watchlist", "error");
      return;
    }
    if (!resp.ok) {
      addAlert("Failed to add ticker to watchlist", "error");
      return;
    };
    setInWatchlist(true);
    addAlert("Successfully added to watchlist", "success");
  };

  const removeTickerFromWatchlist = async () => {
    const token = await getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    };
    let resp;
    try {
      resp = await fetch(`${baseUrl}/watchlist/remove`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ticker })
      });
    } catch (err) {
      addAlert("Failed to remove ticker from watchlist", "error");
      return;
    }
    if (!resp.ok) {
      addAlert("Failed to remove ticker from watchlist", "error");
      return;
    }
    setInWatchlist(false);
    addAlert("Successfully removed from watchlist", "success");
  };

  const handleZoom = (e) => {
    const zoomFactor = 1.2;
    const direction = e.deltaY > 0 ? 1 : -1;
    const diff = endDate - startDate;
    const newDiff = direction > 0 ? diff * zoomFactor : diff / zoomFactor;

    const center = new Date((startDate.getTime() + endDate.getTime()) / 2);
    let newStart = new Date(center.getTime() - newDiff / 2);
    let newEnd = new Date(center.getTime() + newDiff / 2);

    const minZoomDuration = 1000 * 60 * 60 * 24 * 3; // 3 days in milliseconds

    // Prevent zooming in too much
    if (newEnd - newStart < minZoomDuration) return;

    // Prevent zooming out beyond fetched data
    if (minFetchedDate && newStart < minFetchedDate) newStart = minFetchedDate;
    if (maxFetchedDate && newEnd > maxFetchedDate) newEnd = maxFetchedDate;

    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    e.preventDefault();

    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = e.clientX;

    const chartWidth = chartRef.current?.offsetWidth || 800;
    const timePerPixel = (endDate.getTime() - startDate.getTime()) / chartWidth;
    const deltaTime = -deltaX * timePerPixel;

    let newStart = new Date(startDate.getTime() + deltaTime);
    let newEnd = new Date(endDate.getTime() + deltaTime);

    // Clamp to fetched data range
    if (minFetchedDate && newStart < minFetchedDate) {
      const offset = minFetchedDate.getTime() - newStart.getTime();
      newStart = new Date(newStart.getTime() + offset);
      newEnd = new Date(newEnd.getTime() + offset);
    }
    if (maxFetchedDate && newEnd > maxFetchedDate) {
      const offset = newEnd.getTime() - maxFetchedDate.getTime();
      newStart = new Date(newStart.getTime() - offset);
      newEnd = new Date(newEnd.getTime() - offset);
    }

    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const activeSegmentId = selectedSegmentId ?? hoveredSegmentId;
  const selectedSegment = segments.find((seg) => seg.id === activeSegmentId);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 3, padding: 20 }}>
        <h2 className="text-xl font-bold">{ticker ? `${stockName} (${ticker.toUpperCase()})` : 'Loading...'}
          {inWatchlist !== null && (
            inWatchlist ? (
              <button onClick={removeTickerFromWatchlist}>
                <BookmarkFilledIcon className="w-6 h-6 stroke-[2] text-blue-600 mx-1 p-1 items-center rounded hover:bg-gray-100 transition" />
              </button>
            ) : (
              <button onClick={addTickerToWatchlist}>
                <BookmarkOutlineIcon className="w-6 h-6 stroke-[2] text-blue-600 mx-1 p-1 items-center rounded hover:bg-gray-100 transition" />
              </button>
            )
          )}
        </h2>
        {beta !== null && (
          <div><strong>Risk Classification<InfoTooltip text={`This classification is derived from the beta value (${beta.toFixed(2)}):

< 0: Inverse Market Risk
0: No Market Risk
0–1: Low Risk
1: Average Risk
1–2: High Risk
> 2: Very High Risk

Beta measures a stock's volatility compared to the market`} />:</strong> {riskCategory}</div>
        )}
        <div className="flex items-center gap-4 mt-4 mb-2">
          <label htmlFor="range-select">View Range:</label>
          <select id="range-select" onChange={(e) => {
            const value = e.target.value;
            const now = new Date();
            const newStart = new Date(now);
            if (value.endsWith('Y')) newStart.setFullYear(now.getFullYear() - parseInt(value));
            else newStart.setMonth(now.getMonth() - parseInt(value));
            setStartDate(newStart);
            setEndDate(now);
          }} defaultValue="3">
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
            <LineChart
              data={visibleStockData}
              onMouseMove={(state) => {
                if (!state.isTooltipActive || !state.activePayload || !state.activePayload[0]) return null;
                if (state.isTooltipActive) {
                  const yValue = state.activePayload[0]?.payload.price; // your y key here
                  setHoverY(yValue);
                } else {
                  setHoverY(null);
                }
              }}
              onMouseLeave={() => setHoverY(null)}
            >
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" minTickGap={30} />
              <YAxis
                type="number"
                domain={([dataMin, dataMax]) => [Math.max(dataMin - 10, 0), dataMax + 10]}
                tickCount={5} tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip
                cursor={({ y, width }) => (
                  <line
                    x1={0}
                    y1={y}
                    x2={width}
                    y2={y}
                    stroke="gray"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                )}
              />
              <Line type="monotone" dataKey="price" stroke="#007bff" strokeWidth={2} dot={false} isAnimationActive={false} />
              {segments.map(segment =>
                SegmentHighlighter(segment, visibleStockData, selectedSegmentId === segment.id, setSelectedSegmentId, hoveredSegmentId === segment.id, setHoveredSegmentId)
              )}
              {hoverY !== null && (
                <ReferenceLine
                  y={hoverY}
                  stroke="gray"
                  strokeDasharray="3 3"
                  ifOverflow="visible"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <NewsPanel {...selectedSegment} />
    </div>
  );
}

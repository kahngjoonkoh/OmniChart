// // src/pages/ChartDisplay.jsx
// import React, { useState } from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
//   ReferenceArea
// } from 'recharts';
// import SegmentHighlighter from '../components/SegmentHighlight';
// import NewsPanel from '../components/NewsPanel';

// const generateData = () => {
//   const data = [];
//   let price = 150;
//   let date = new Date();
//   date.setFullYear(date.getFullYear() - 1);

//   for (let i = 0; i < 252; i++) {
//     if (i === 50) price -= 20;    // Drop #1
//     else if (i === 100) price += 30; // Rally #1
//     else if (i === 140) price -= 25; // Drop #2
//     else if (i === 180) price += 40; // Rally #2
//     else if (i === 220) price -= 15; // Drop #3
//     else price += (Math.random() - 0.5) * 2;

//     data.push({
//       date: date.toISOString().slice(0, 10),
//       price: parseFloat(price.toFixed(2)),
//     });
//     date.setDate(date.getDate() + 1);
//   }
//   return data;
// };

// const stockData = generateData();

// const segments = [
//   {
//     id: 'drop1',
//     startIndex: 45,
//     endIndex: 55,
//     title: 'Q2 Guidance Miss Sparks Sell‐Off',
//     news: [
//       "Company lowered Q2 guidance by 10%; revenue forecast trimmed accordingly.",
//       "Analysts cited weaker demand in Europe and inventory buildup.",
//       "Shares fell 12% in pre‐market trading as investors reacted.",
//     ],
//   },
//   {
//     id: 'rally1',
//     startIndex: 95,
//     endIndex: 105,
//     title: 'Breakthrough AI Partnership Announced',
//     news: [
//       "Firm partners with leading AI startup to co-develop next-gen GPUs.",
//       "CEO promises “exponential performance gains” for data centers.",
//       "Analyst upgrades price target by 25% on optimistic growth outlook.",
//     ],
//   },
//   {
//     id: 'drop2',
//     startIndex: 135,
//     endIndex: 145,
//     title: 'Regulatory Probe Weighs on Stock',
//     news: [
//       "Regulators subpoena key documents over potential antitrust issues.",
//       "Insiders expect fines in the hundreds of millions; risk to margins.",
//       "Shares tumbled 8% after the probe announcement.",
//     ],
//   },
//   {
//     id: 'rally2',
//     startIndex: 175,
//     endIndex: 185,
//     title: 'Record Q3 Earnings Drive Shares Higher',
//     news: [
//       "Q3 revenue beats consensus by 15%, driven by strong data center sales.",
//       "Gross margins expanded 300 bps YoY due to cost efficiencies.",
//       "Management raises full‐year outlook; shares jump 18% on the news.",
//     ],
//   },
//   {
//     id: 'drop3',
//     startIndex: 215,
//     endIndex: 225,
//     title: 'Macroeconomic Uncertainty Triggers Pullback',
//     news: [
//       "Rising interest rates and inflation fears cause wide sector sell‐off.",
//       "Investors rotate out of tech into defensive sectors.",
//       "Shares decline 10% over two trading days amid market turbulence.",
//     ],
//   },
// ];

// export default function ChartDisplay() {
//   const [selectedSegmentId, setSelectedSegmentId] = useState(segments[0].id);
//   const [comments, setComments] = useState({});

//   const selectedSegment = segments.find((seg) => seg.id === selectedSegmentId);

//   return (
//     <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
//       {/* Left: Chart */}
//       <div style={{ flex: 3, padding: 20 }}>
//         <h2>NVIDIA Corporation (NVDA)</h2>
//         <ResponsiveContainer width="100%" height={400}>
//           <LineChart data={stockData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
//             <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
//             <XAxis dataKey="date" minTickGap={30} />
//             <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
//             <Tooltip />
//             <Line type="monotone" dataKey="price" stroke="#007bff" dot={false} />
//               {/* Render all defined segments */}
//               {segments.map((segment) => {
//                 return (
//                 SegmentHighlighter(
//                     segment,
//                     stockData,
//                     selectedSegmentId === segment.id,
//                     setSelectedSegmentId
//                 )
//                 );
//               })};
//             </LineChart>
//         </ResponsiveContainer>
//       </div>
//       {/* Right: News and Comments */}
//       <NewsPanel
//         segment={selectedSegment}
//         comments={comments}
//         setComments={setComments}
//       />
//     </div>
//   );
// }

// below is version that uses database:
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import SegmentHighlighter from '../components/SegmentHighlight';
import NewsPanel from '../components/NewsPanel';
import { data, useParams } from 'react-router-dom';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

const generateStockData = async (ticker) => {
  if (!ticker) {
    console.error("Error: Ticker symbol is undefined or empty. Cannot fetch stock data.");
    return []; // Return an empty array immediately
  }
  try {
    console.log("HIHIH")
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
  console.log("HIHIHIFAS")
  console.log(ticker)
  const [stockData, setStockData] = useState([]);
  const [stockName, setStockName] = useState([])
  const [segments, setSegments] = useState([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState(null);

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
        console.log("THIS IS THE URL USED HEREREE:", `${baseUrl}/events/${ticker}`);
        const res = await axios.get(`${baseUrl}/events/${ticker}`);
        const events = res.data;

        console.log('Fetched ticker_events:', events);

        // Fetch associated events for each ticker_event
        const enrichedSegments = await Promise.all(events.map(async (event) => {
          try {
            console.log("executed here 1000");
            return {
              id: event.id,
              startIndex: event.start_index,
              endIndex: event.end_index,
              title: event.events.title,
              news: event.events.content
            };
          } catch (innerErr) {
            console.error(`Failed to fetch event ${event.event_id}:`, innerErr);
            return {
              id: event.id,
              startIndex: event.start_index,
              endIndex: event.end_index,
              title: "Untitled",
              news: []
            };
          }
        }));
        console.log("executed here");

        console.log('Enriched segments:', enrichedSegments);
        setSegments(enrichedSegments);

        console.log("segment length:", segments.length);

        if (segments.length > 0) {
          console.log("this works");
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

  const selectedSegment = segments.find((seg) => seg.id === selectedSegmentId);

  // console.log("this truly is:", selectedSegment.id);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ flex: 3, padding: 20 }}>
        <h2>{ticker ? `${stockName} (${ticker.toUpperCase()})` : 'Loading...'}</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={stockData}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="date" minTickGap={30} />
            <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#007bff" dot={false} />
            {segments.map((segment) =>
              SegmentHighlighter(
                segment,
                stockData,
                selectedSegmentId === segment.id,
                setSelectedSegmentId
              )
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Debug: show the raw segments returned from the API */}
        <div style={{ marginTop: 20, color: '#555' }}>
          <h4>Debug: Fetched Segments Data</h4>
          <pre
            style={{
              maxHeight: 200,
              overflowY: 'auto',
              backgroundColor: '#f0f0f0',
              padding: 10,
              borderRadius: 4,
            }}
          >
            {JSON.stringify(segments, null, 2)}
          </pre>
        </div>
      </div>

      {/* <NewsPanel {...selectedSegment} /> */}
      {/* {NewsPanel(selectedSegment)} */}

      {/* {segments.map((segment) => NewsPanel(segment))} */}
      <NewsPanel {...selectedSegment} />
    </div>
  );
}

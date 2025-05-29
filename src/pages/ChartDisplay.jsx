// import React, { useEffect, useRef } from 'react';
// import * as LightweightCharts from 'lightweight-charts';

// const API_KEY = 'PK8V3AUU7GPF0I4M4DA2';
// const API_SECRET = 'QbWyWLqoVCcII13wYmWbUw97KzzNgIDMsn2wQeeT';
// const SYMBOL = 'AAPL';

// function ChartDisplay() {
//   const chartContainerRef = useRef();
//   const candleSeriesRef = useRef();

//   useEffect(() => {
//     if (!chartContainerRef.current) return;

//     const chart = LightweightCharts.createChart(chartContainerRef.current, {
//       width: chartContainerRef.current.clientWidth,
//       height: chartContainerRef.current.clientHeight,
//       layout: { backgroundColor: '#fff', textColor: '#000' },
//       grid: { vertLines: { color: '#eee' }, horzLines: { color: '#eee' } },
//       timeScale: { timeVisible: true, borderColor: '#ccc' },
//     });

//     candleSeriesRef.current = chart.addSeries(LightweightCharts.CandlestickSeries, {
//       upColor: '#26a69a',
//       downColor: '#ef5350',
//       borderVisible: false,
//       wickUpColor: '#26a69a',
//       wickDownColor: '#ef5350',
//     });

//     async function fetchData() {
//       const endDate = new Date();
//       const startDate = new Date();
//       startDate.setFullYear(endDate.getFullYear() - 1); // Fetch data for the past year

//       const url = `https://data.alpaca.markets/v2/stocks/${SYMBOL}/bars?timeframe=1Day&start=${startDate.toISOString()}&end=${endDate.toISOString()}`;
//       const res = await fetch(url, {
//         headers: {
//           'APCA-API-KEY-ID': API_KEY,
//           'APCA-API-SECRET-KEY': API_SECRET,
//         },
//       });

//       const data = await res.json();
//       console.log('Bars data:', data);

//       if (data.bars && data.bars.length > 0) {
//         const formatted = data.bars.map(bar => ({
//           time: Math.floor(new Date(bar.t).getTime() / 1000),
//           open: bar.o,
//           high: bar.h,
//           low: bar.l,
//           close: bar.c,
//         }));
//         candleSeriesRef.current.setData(formatted);
//       } else {
//         console.error('No bar data received:', data);
//       }
//     }

//     fetchData();

//     return () => chart.remove();
//   }, []);

//   return (
//     <div
//       ref={chartContainerRef}
//       style={{
//         width: '100vw', // 100% of the viewport width
//         height: '75vh', // 75% of the viewport height
//         border: '1px solid red',
//         position: 'absolute',
//         top: 0,
//         left: 0,
//       }}
//     />
//   );
// }

// above code is attempt to build interact chart

// export default ChartDisplay;
import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceArea,
} from 'recharts';

// Generate some dummy stock price data for 1 year (~252 trading days)
const generateData = () => {
  const data = [];
  let price = 150;
  let date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  for (let i = 0; i < 252; i++) {
    // Simulate daily price change
    if (i === 100) price -= 30; // Sharp drop at day 100
    else price += (Math.random() - 0.5) * 2;

    data.push({
      date: date.toISOString().slice(0, 10),
      price: parseFloat(price.toFixed(2)),
    });
    date.setDate(date.getDate() + 1);
  }
  return data;
};

const stockData = generateData();

const sharpDropSegment = {
  startIndex: 95,
  endIndex: 110,
  news: [
    "Company X reported unexpected losses due to supply chain issues.",
    "Global market volatility caused sharp stock price correction.",
    "CEO announced strategic restructuring to address downturn.",
  ],
};

export default function ChartDisplay() {
  const [hovered, setHovered] = useState(false);

  // Extract the date range for ReferenceArea
  const startDate = stockData[sharpDropSegment.startIndex].date;
  const endDate = stockData[sharpDropSegment.endIndex].date;

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Left: Chart */}
      <div style={{ flex: 3, padding: 20 }}>
        <h2>Stock Price Chart (1 Year)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={stockData}
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
          >
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="date" minTickGap={30} />
            <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#007bff" dot={false} />

            {/* Highlight sharp drop segment */}
            <ReferenceArea
              x1={startDate}
              x2={endDate}
              strokeOpacity={0}
              fill="rgba(255, 0, 0, 0.15)"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            />
          </LineChart>
        </ResponsiveContainer>

        <div style={{ marginTop: 10, color: '#d9534f', fontWeight: 'bold' }}>
          <i>Hover over the red shaded area to see business news.</i>
        </div>
      </div>

      {/* Right: News panel */}
      <div
        style={{
          flex: 1,
          borderLeft: '1px solid #ccc',
          padding: 20,
          backgroundColor: '#f9f9f9',
          transition: 'transform 0.3s ease',
          transform: hovered ? 'translateX(0)' : 'translateX(100%)',
          overflowY: 'auto',
        }}
      >
        <h3>Relevant Business News</h3>
        {hovered ? (
          <ul>
            {sharpDropSegment.news.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 10 }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#aaa' }}>Hover over the chart segment to see news here.</p>
        )}
      </div>
    </div>
  );
}

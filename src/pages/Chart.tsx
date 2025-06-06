// src/pages/Chart.jsx
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { createChart } from 'lightweight-charts';

// Access the API base URL from environment variables
const baseUrl = import.meta.env.VITE_API_URL;

const Chart = () => {
  // Ref to the DOM element that will contain the chart
  const chartContainerRef = useRef();
  // Get the 'ticker' parameter from the URL (e.g., /chart/NVDA)
  const { ticker } = useParams();

  // useEffect hook to initialize and manage the chart lifecycle
  useEffect(() => {
    // Ensure the chart container exists before creating the chart
    if (!chartContainerRef.current) {
      return;
    }

    // Create the chart instance
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500, // Fixed height for the chart
      layout: {
        backgroundColor: '#1e1e1e', // Dark background
        textColor: '#d1d4dc',       // Light text color
      },
      grid: {
        vertLines: { color: '#2b2b43' }, // Vertical grid lines color
        horzLines: { color: '#2b2b43' }, // Horizontal grid lines color
      },
      priceScale: {
        borderColor: '#485c7b', // Price scale border color
      },
      timeScale: {
        borderColor: '#485c7b', // Time scale border color
        timeVisible: true,      // Show time on the scale
        secondsVisible: false,  // Hide seconds for cleaner display
      },
    });

    // Add a candlestick series to the chart
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',   // Color for rising candles
      downColor: '#ef5350', // Color for falling candles
      borderVisible: false, // Hide borders for candles
      wickColor: '#d1d4dc', // Wick color
    });

    // Fetch data from your API
    // The ticker symbol is converted to uppercase for the API call
    fetch(`${baseUrl}/bars/${ticker.toUpperCase()}`)
      .then((res) => {
        // Check if the response was successful
        if (!res.ok) {
          // If not, throw an error to be caught by the .catch block
          throw new Error(`Failed to fetch chart data: ${res.status} ${res.statusText}`);
        }
        // Parse the JSON response
        return res.json();
      })
      .then(data => {
        // Ensure data.bars exists and is an array
        if (!data || !Array.isArray(data.bars)) {
          console.error("API response does not contain a 'bars' array:", data);
          return;
        }

        // Format the fetched data for Lightweight Charts
        // Lightweight Charts expects data in the format:
        // { time: Unix timestamp in seconds, open: ..., high: ..., low: ..., close: ... }
        const formattedData = data.bars.map(bar => ({
          time: new Date(bar.timestamp).getTime() / 1000, // Convert ISO string to Unix timestamp (seconds)
          open: parseFloat(bar.open),   // Ensure numerical type
          high: parseFloat(bar.high),   // Ensure numerical type
          low: parseFloat(bar.low),     // Ensure numerical type
          close: parseFloat(bar.close), // Ensure numerical type
        }));

        // Set the formatted data to the candlestick series
        candleSeries.setData(formattedData);
      })
      .catch(err => {
        // Log any errors during the fetch or data processing
        console.error('Error loading chart data:', err);
      });

    // Function to handle chart resizing when the window size changes
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup function: runs when the component unmounts or dependencies change
    return () => {
      window.removeEventListener('resize', handleResize); // Remove resize listener
      chart.remove(); // Dispose of the chart instance to prevent memory leaks
    };
  }, [ticker]); // Re-run useEffect when the 'ticker' changes

  // Render the div that will serve as the chart container
  return (
    <div
      ref={chartContainerRef}
      style={{ width: '100%', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      {/* You can add a loading spinner or message here while data is fetching */}
      <p className="text-gray-400">Loading chart data...</p>
    </div>
  );
};

export default Chart;
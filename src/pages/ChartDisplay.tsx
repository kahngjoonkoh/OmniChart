import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import SegmentHighlighter from '../components/SegmentHighlight.tsx';
import NewsPanel from '../components/NewsPanel.tsx';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL as string;

// Define types for the data you receive
interface BarData {
  t: string;       // timestamp string
  c: number;       // close price
  o?: number;      // open price (optional)
  h?: number;      // high price (optional)
  l?: number;      // low price (optional)
}

interface FormattedData {
  date: string;    // e.g. "2025-06-06"
  price: number;
}

interface Event {
  id: string;
  start_index: number;
  end_index: number;
  event_id?: string;
  events: {
    title: string;
    content: string[];
  };
}

interface Segment {
  id: string;
  startIndex: number;
  endIndex: number;
  title: string;
  news: string[];
}

interface StockNameResponse {
  stocks: { name: string }[];
}

const generateStockData = async (ticker: string | undefined): Promise<FormattedData[]> => {
  if (!ticker) {
    console.error("Error: Ticker symbol is undefined or empty. Cannot fetch stock data.");
    return [];
  }
  try {
    const response = await fetch(`${baseUrl}/bars/${ticker}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stock data: ${response.status} ${response.statusText}`);
    }
    const apiData: BarData[] = await response.json();

    const formattedData: FormattedData[] = apiData.map(bar => ({
      date: new Date(bar.t).toISOString().slice(0, 10),
      price: parseFloat(bar.c.toFixed(2)),
    }));

    return formattedData;
  } catch (error) {
    console.error('Error in generateStockData:', error);
    return [];
  }
};

export default function ChartDisplay(): JSX.Element {
  const { ticker } = useParams<{ ticker: string }>();
  const [stockData, setStockData] = useState<FormattedData[]>([]);
  const [stockName, setStockName] = useState<string>('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockData() {
      if (!ticker) return;
      const data = await generateStockData(ticker);
      setStockData(data);
    }
    fetchStockData();
  }, [ticker]);

  useEffect(() => {
    async function fetchStockName() {
      if (!ticker) return;
      try {
        const res = await axios.get<StockNameResponse>(`${baseUrl}/search?q=${ticker}`);
        setStockName(res.data.stocks[0]?.name || '');
      } catch (error) {
        console.error('Error fetching stock name:', error);
      }
    }
    fetchStockName();
  }, [ticker]);

  useEffect(() => {
    async function fetchTickerEvents() {
      if (!ticker) return;
      try {
        const res = await axios.get<Event[]>(`${baseUrl}/events/${ticker}`);
        const events = res.data;

        const enrichedSegments: Segment[] = events.map(event => ({
          id: event.id,
          startIndex: event.start_index,
          endIndex: event.end_index,
          title: event.events.title,
          news: event.events.content,
        }));

        setSegments(enrichedSegments);

        if (enrichedSegments.length > 0) {
          setSelectedSegmentId(enrichedSegments[0].id);
        }
      } catch (error) {
        console.error("Error fetching ticker events", error);
      }
    }
    fetchTickerEvents();
  }, [ticker]);

  const selectedSegment = segments.find(seg => seg.id === selectedSegmentId) ?? null;

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
            {segments.map(segment =>
              SegmentHighlighter(
                segment,
                stockData,
                selectedSegmentId === segment.id,
                setSelectedSegmentId
              )
            )}
          </LineChart>
        </ResponsiveContainer>

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

      {selectedSegment && <NewsPanel {...selectedSegment} />}
    </div>
  );
}

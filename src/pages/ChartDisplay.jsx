// src/pages/ChartDisplay.jsx
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import SegmentHighlighter from '../components/SegmentHighlight';
import NewsPanel from '../components/NewsPanel';

const generateData = () => {
  const data = [];
  let price = 150;
  let date = new Date();
  date.setFullYear(date.getFullYear() - 1);

  for (let i = 0; i < 252; i++) {
    if (i === 50) price -= 20;    // Drop #1
    else if (i === 100) price += 30; // Rally #1
    else if (i === 140) price -= 25; // Drop #2
    else if (i === 180) price += 40; // Rally #2
    else if (i === 220) price -= 15; // Drop #3
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

const segments = [
  {
    id: 'drop1',
    startIndex: 45,
    endIndex: 55,
    title: 'Q2 Guidance Miss Sparks Sell‐Off',
    news: [
      "Company lowered Q2 guidance by 10%; revenue forecast trimmed accordingly.",
      "Analysts cited weaker demand in Europe and inventory buildup.",
      "Shares fell 12% in pre‐market trading as investors reacted.",
    ],
  },
  {
    id: 'rally1',
    startIndex: 95,
    endIndex: 105,
    title: 'Breakthrough AI Partnership Announced',
    news: [
      "Firm partners with leading AI startup to co-develop next-gen GPUs.",
      "CEO promises “exponential performance gains” for data centers.",
      "Analyst upgrades price target by 25% on optimistic growth outlook.",
    ],
  },
  {
    id: 'drop2',
    startIndex: 135,
    endIndex: 145,
    title: 'Regulatory Probe Weighs on Stock',
    news: [
      "Regulators subpoena key documents over potential antitrust issues.",
      "Insiders expect fines in the hundreds of millions; risk to margins.",
      "Shares tumbled 8% after the probe announcement.",
    ],
  },
  {
    id: 'rally2',
    startIndex: 175,
    endIndex: 185,
    title: 'Record Q3 Earnings Drive Shares Higher',
    news: [
      "Q3 revenue beats consensus by 15%, driven by strong data center sales.",
      "Gross margins expanded 300 bps YoY due to cost efficiencies.",
      "Management raises full‐year outlook; shares jump 18% on the news.",
    ],
  },
  {
    id: 'drop3',
    startIndex: 215,
    endIndex: 225,
    title: 'Macroeconomic Uncertainty Triggers Pullback',
    news: [
      "Rising interest rates and inflation fears cause wide sector sell‐off.",
      "Investors rotate out of tech into defensive sectors.",
      "Shares decline 10% over two trading days amid market turbulence.",
    ],
  },
];

export default function ChartDisplay() {
  const [selectedSegmentId, setSelectedSegmentId] = useState(segments[0].id);
  const [comments, setComments] = useState({});

  const selectedSegment = segments.find((seg) => seg.id === selectedSegmentId);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Left: Chart */}
      <div style={{ flex: 3, padding: 20 }}>
        <h2>NVIDIA Corporation (NVDA)</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={stockData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
            <XAxis dataKey="date" minTickGap={30} />
            <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#007bff" dot={false} />
              {/* Render all defined segments */}
              {segments.map((segment) => {
                return (
                SegmentHighlighter(
                    segment,
                    stockData,
                    selectedSegmentId === segment.id,
                    setSelectedSegmentId
                )
                );
              })};
            </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Right: News and Comments */}
      <NewsPanel
        segment={selectedSegment}
        comments={comments}
        setComments={setComments}
      />
    </div>
  );
}

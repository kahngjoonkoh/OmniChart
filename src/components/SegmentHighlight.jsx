// src/components/SegmentHighlight.jsx
import React from 'react';
import { ReferenceArea } from 'recharts';

function SegmentHighlighter(segment, data, isSelected, onClick) {
  console.log("this is executed!(500)");
  console.log(segment.id);

  const startObj = data[segment.startIndex];
  const endObj   = data[segment.endIndex];

  if (!startObj || !endObj) return null; // out of bounds guard

  const startDate = startObj.date;
  const endDate   = endObj.date;
  // Determine if this segment represents a rally (price up) or a drop (price down)
  const isRally = endObj.price > startObj.price;

  // Base fill colors:
  //  - Rally: light green
  //  - Drop : light red
  // If selected, use a more opaque version + a black stroke.
  const fillColor = isRally
    ? (isSelected ? 'rgba(0, 200, 0, 0.4)' : 'rgba(0, 200, 0, 0.2)')
    : (isSelected ? 'rgba(200, 0, 0, 0.4)' : 'rgba(200, 0, 0, 0.2)');

  const strokeColor = isSelected ? '#000' : 'none';
  const strokeWidth = isSelected ? 2 : 0;

  return (
    <ReferenceArea
      x1={startDate}
      x2={endDate}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      onClick={() => onClick(segment.id)}
      cursor="pointer"
      ifOverflow="extendDomain"
    />
  );
}

export default SegmentHighlighter;

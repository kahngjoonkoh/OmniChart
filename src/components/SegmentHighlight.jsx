// src/components/SegmentHighlight.jsx
import React from 'react';
import { ReferenceArea } from 'recharts';

function SegmentHighlighter(segment, data, isSelected, onClick, isHovered, onHover) {
  const startObj = data[segment.startIndex];
  const endObj = data[segment.endIndex];

  if (!startObj || !endObj) return null; // out of bounds guard

  const startDate = startObj.date;
  const endDate = endObj.date;
  // Determine if this segment represents a rally (price up) or a drop (price down)
  const isRally = endObj.price > startObj.price;

  // Base fill colors:
  //  - Rally: light green
  //  - Drop : light red
  // If selected, use a more opaque version + a black stroke.
  const fillColor = isRally
    ? (isSelected ? 'rgba(0, 200, 0, 0.4)' : 'rgba(0, 200, 0, 0.2)')
    : (isSelected ? 'rgba(200, 0, 0, 0.4)' : 'rgba(200, 0, 0, 0.2)');

  const isHighlighted = isSelected || isHovered;
  const strokeColor = isHighlighted ? '#000' : 'none';
  const strokeWidth = isHighlighted ? 2 : 0;

  return (
    <ReferenceArea
      x1={startDate}
      x2={endDate}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      // onClick={() => onClick(segment.id)}
      onClick={() => {
        // Toggle selection
        onClick((prev) => (prev === segment.id ? null : segment.id));
      }}
      onMouseEnter={() => onHover?.(segment.id)}
      onMouseLeave={() => onHover?.(null)}
      cursor="pointer"
      ifOverflow="extendDomain"
    />

  );
}

export default SegmentHighlighter;

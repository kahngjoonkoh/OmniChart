// src/components/SegmentHighlight.jsx
import React from 'react';
import { ReferenceArea } from 'recharts';

function SegmentHighlighter(segment, data, isSelected, onClick, isHovered, onHover) {
  // const startObj = data[segment.startIndex];
  // const endObj = data[segment.endIndex];

  // if (!startObj || !endObj) return null; // out of bounds guard

  // const startDate = startObj.date;
  // const endDate = endObj.date;

  const centerDate = new Date(segment.timestamp);

  const x1 = new Date(centerDate);
  x1.setDate(x1.getDate() - 10);

  const x2 = new Date(centerDate);
  x2.setDate(x2.getDate() + 10);

  function binarySearchClosest(targetDate) {
    let left = 0;
    let right = data.length - 1;
    let targetTime = targetDate.getTime();

    if (data.length === 0) return null;
    
    // If targetDate outside range, return closest end
    const firstDate = new Date(data[0].date).getTime();
    const lastDate = new Date(data[right].date).getTime();

    if (targetTime <= firstDate) return data[0];
    if (targetTime >= lastDate) return data[right];

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midDate = new Date(data[mid].date).getTime();

      if (midDate === targetTime) {
        return data[mid];
      } else if (midDate < targetTime) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // After loop, left > right
    // Closest between data[left] and data[right]
    const leftDate = new Date(data[left].date).getTime();
    const rightDate = new Date(data[right].date).getTime();

    return (Math.abs(leftDate - targetTime) < Math.abs(rightDate - targetTime)) ? data[left] : data[right];
  }

  const startObj = binarySearchClosest(x1);
  const endObj = binarySearchClosest(x2);

    // Safeguard: don’t render if data is missing or invalid
    if (!startObj || !endObj || isNaN(startObj.price) || isNaN(endObj.price)) return null;

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
      x1={startObj.date}
      x2={endObj.date}
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

// src/components/NewsPanel.jsx
import React from 'react';
import CommentSection from './CommentSection';

export default function NewsPanel({ segment, comments, setComments }) {
  // Map segment IDs to their own dummy comments
  const dummyBySegment = {
    drop1: [
      'This sell‐off makes sense given Q2 miss.',
      'I was surprised by the pre‐market drop.',
    ],
    rally1: [
      'AI partnership is huge for data‐centers.',
      'Excited to see next‐gen GPU news!',
    ],
    drop2: [
      'Antitrust probes always spook investors.',
      'Wondering how big the fine could be.',
    ],
    rally2: [
      'Record Q3 was inevitable with data‐center growth.',
      'The 18% jump was astonishing.',
    ],
    drop3: [
      'Macroeconomic headwinds are still very real.',
      'Tech always feels the pullback first.',
    ],
  };

  // Get all real comments for this segment (an array), or empty array if none
  const segmentComments = comments[segment.id] || [];

  return (
    <div
      style={{
        flex: 1,
        borderLeft: '1px solid #ccc',
        padding: 20,
        backgroundColor: '#f9f9f9',
        overflowY: 'auto',
      }}
    >
      <h3>{segment.title}</h3>

      <ul>
        {segment.news.map((item, idx) => (
          <li key={idx} style={{ marginBottom: 10 }}>
            <div>{item}</div>
          </li>
        ))}
      </ul>

      {/* Single comment section for the entire segment */}
      <CommentSection
        comments={segmentComments}
        dummyComments={dummyBySegment[segment.id] || []}
        onAdd={(text) => {
          const updated = { ...comments };

          if (!updated[segment.id]) {
            updated[segment.id] = [];
          }

          updated[segment.id] = [...updated[segment.id], text];
          setComments(updated);
        }}
      />
    </div>
  );
}

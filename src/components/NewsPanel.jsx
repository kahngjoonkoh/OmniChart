// // src/components/NewsPanel.jsx
// import React from 'react';
// import CommentSection from './CommentSection';

// export default function NewsPanel({ segment, comments, setComments }) {
//   // Map segment IDs to their own dummy comments
//   const dummyBySegment = {
//     drop1: [
//       'This sell‐off makes sense given Q2 miss.',
//       'I was surprised by the pre‐market drop.',
//     ],
//     rally1: [
//       'AI partnership is huge for data‐centers.',
//       'Excited to see next‐gen GPU news!',
//     ],
//     drop2: [
//       'Antitrust probes always spook investors.',
//       'Wondering how big the fine could be.',
//     ],
//     rally2: [
//       'Record Q3 was inevitable with data‐center growth.',
//       'The 18% jump was astonishing.',
//     ],
//     drop3: [
//       'Macroeconomic headwinds are still very real.',
//       'Tech always feels the pullback first.',
//     ],
//   };

//   // Get all real comments for this segment (an array), or empty array if none
//   const segmentComments = comments[segment.id] || [];

//   return (
//     <div
//       style={{
//         flex: 1,
//         borderLeft: '1px solid #ccc',
//         padding: 20,
//         backgroundColor: '#f9f9f9',
//         overflowY: 'auto',
//       }}
//     >
//       <h3>{segment.title}</h3>

//       <ul>
//         {segment.news.map((item, idx) => (
//           <li key={idx} style={{ marginBottom: 10 }}>
//             <div>{item}</div>
//           </li>
//         ))}
//       </ul>

//       {/* Single comment section for the entire segment */}
//       <CommentSection
//         comments={segmentComments}
//         dummyComments={dummyBySegment[segment.id] || []}
//         onAdd={(text) => {
//           const updated = { ...comments };

//           if (!updated[segment.id]) {
//             updated[segment.id] = [];
//           }

//           updated[segment.id] = [...updated[segment.id], text];
//           setComments(updated);
//         }}
//       />
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import CommentSection from './CommentSection';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

function SplitNews({news}) {
if (!news) {
  return null; // or a loading spinner
}

return (
  <ul>
    {news
      .split(".")
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map((item, idx) => (
        <li key={idx} style={{ marginBottom: 10 }}>
          <div>{item}.</div>
        </li>
      ))}
  </ul>
);
}

function NewsPanel({ id, startIndex, endIndex, title, news, source_url }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await axios.get(`${baseUrl}/comments/${id}`);
        setComments(res.data);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      }
    }

    fetchComments();
  }, [id]);

  const handleAddComment = async (text) => {
    try {
      const res = await axios.post(`${baseUrl}/comments`, {
        content: text,
        ticker_event_id: id,
        user_id: '743eea30-f699-4734-9cc1-3cedd832ba69', // Replace with actual user ID in real app
      });

      setComments((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  return (
    <div style={{ flex: 1, borderLeft: '1px solid #ccc', padding: 20, overflowY: 'auto' }}>
      <h2>{title}</h2>
      <SplitNews news={news} />
      
      {source_url && (
        <div style={{ marginTop: 10 }}>
          <span style={{ fontWeight: 'bold' }}>Source: </span>
          <a href={source_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1a0dab' }}>
            {source_url}
          </a>
        </div>
      )}

      <CommentSection
        comments={comments}
        onAdd={handleAddComment}
      />
    </div>
  );
}

export default NewsPanel;
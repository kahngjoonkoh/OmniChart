import { useEffect, useState } from 'react';
import CommentSection from './CommentSection';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL;

function SplitNews({ news }) {
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
      {!id && (
        <div style={{ color: '#777', textAlign: 'center' }}>
          📰 Click or hover a colored chart area to view its related news event.
        </div>
      )}
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

      {id && (
        <CommentSection
          comments={comments}
          onAdd={handleAddComment}
        />
      )}
    </div>
  );
}

export default NewsPanel;
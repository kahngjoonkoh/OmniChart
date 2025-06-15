import { useState, useEffect } from 'react';
import { getAccessToken, updateLoginStatus } from '../client/Auth';

const baseUrl = import.meta.env.VITE_API_URL;

export default function CommentSection({ id }) {
  // States for posting new comments
  const [newComment, setNewComment] = useState('');
  const [newSentiment, setNewSentiment] = useState(null);

  // State for existing comments
  const [comments, setComments] = useState([]);
  const [loginStatus, setLoginStatus] = useState(null);
  const [settings, setSettings] = useState({ sentiment: "", ascending: false });

  useEffect(() => {
    updateLoginStatus(setLoginStatus);
  }, []);

  useEffect(() => {
    async function fetchComments() {
      try {
        const resp = await fetch(`${baseUrl}/comments/${id}?${new URLSearchParams(settings).toString()}`);
        if (!resp.ok) {
          console.error("Failed to retrieve comments");
          return;
        }
        const comments = await resp.json();
        setComments(comments);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      }
    }

    fetchComments();
  }, [id, settings]);

  const handlePostComment = async () => {
    const content = newComment.trim();
    if (!content || !newSentiment) {
      return;
    }
    const token = await getAccessToken();
    try {
      const resp = await fetch(`${baseUrl}/comments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          content: content,
          ticker_event_id: id,
          sentiment: newSentiment
        })
      })
      if (!resp.ok) {
        console.error("Failed to post comment");
        return;
      }
      const data = await resp.json();
      if (newSentiment == settings.sentiment || !settings.sentiment) {
        setComments((prev) => settings.ascending? [...prev, data] : [data, ...prev]);
      }
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const newSentimentCheckbox = (senti) => {
    return <label>
      <input
        type="checkbox"
        checked={senti == newSentiment}
        onChange={(e) => {
          if (e.target.checked) setNewSentiment(senti)
        }}
      />
      {senti}
    </label>
  }

  return (
    <div style={{ marginTop: 10, paddingLeft: 10 }}>
      {loginStatus && <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handlePostComment();
          }}
          style={{
            flex: 1,
            fontSize: 12,
            padding: '4px 6px',
            border: '1px solid #ccc',
            borderRadius: 4
          }}
        />
        {newSentimentCheckbox("up")}
        {newSentimentCheckbox("neutral")}
        {newSentimentCheckbox("down")}
        <button
          onClick={handlePostComment}
          style={{
            fontSize: 12,
            marginLeft: 5,
            padding: '4px 10px',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Post
        </button>
      </div>}

      <h2>Comments</h2>
      <select name="sentiment" onChange={(e) => {
        setSettings({ ...settings, sentiment: e.target.value })
      }}>
        <option value="">all</option>
        <option value="up">up</option>
        <option value="neutral">neutral</option>
        <option value="down">down</option>
      </select>
      <select name="order" onChange={(e) => {
        setSettings({ ...settings, ascending: e.target.value })
      }}>
        <option value={false}>Latest to earliest</option>
        <option value={true}>Earliest to latest</option>
      </select>
      <ul>
        {comments.map((c, i) => (
          <li key={i}>
            <div style={{ fontSize: 12, marginBottom: 5, color: '#555' }}>
              <p>{c.username} {c.sentiment} {(new Date(c.created_at)).toLocaleString()}</p>
              <p>• {c.content}</p>
            </div>
          </li>
        ))}
      </ul>
      
    </div>
  );
}


import { useState, useEffect } from 'react';
import { getAccessToken, supabase, updateLoginStatus } from '../client/Auth';
import { useAlert } from './AlertBox';
import { useNavigate } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_API_URL;

export default function CommentSection({ id }) {
  // States for posting new comments
  const [newComment, setNewComment] = useState('');
  const [newSentiment, setNewSentiment] = useState(null);

  // State for existing comments
  const [comments, setComments] = useState([]);
  const [loginStatus, setLoginStatus] = useState(null);
  const [settings, setSettings] = useState({ sentiment: "", ascending: false });

  const { addAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    updateLoginStatus(setLoginStatus);
  }, []);

  useEffect(() => {
    async function fetchComments() {
      let resp;
      try {
        resp = await fetch(`${baseUrl}/comments/${id}?${new URLSearchParams(settings).toString()}`);
      } catch (err) {
        addAlert("Failed to fetch comments", "error")
        return;
      }
      if (!resp.ok) {
        addAlert("Failed to fetch comments", "error")
        return;
        // console.error("Failed to retrieve comments");
      }
      const comments = await resp.json();
      setComments(comments);
    }

    fetchComments();

    // Real-time subscription
    const subscription = supabase
      .channel('public:comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          console.log("new comment");
          if (payload.new.ticker_event_id === id && 
            (payload.new.sentiment === settings.sentiment || !settings.sentiment))
            setComments((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [id, settings]);

  const handlePostComment = async () => {
    const content = newComment.trim();

    if (!content) {
      addAlert("Please enter a comment before posting", "warning");
      return;
    }

    if (!newSentiment) {
      addAlert("Please select a sentiment (opinion) before posting", "warning");
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      navigate('/login');
      return;
    }

    let resp;
    try {
      resp = await fetch(`${baseUrl}/comments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          ticker_event_id: id,
          sentiment: newSentiment
        })
      });
    } catch (err) {
      addAlert("Failed to post comment", "error");
      return;
    }

    if (!resp.ok) {
      addAlert("Failed to post comment", "error");
      // console.error("Failed to post comment");
      return;
    }

    const data = await resp.json();

    if (newSentiment === settings.sentiment || !settings.sentiment) {
      setComments((prev) => settings.ascending ? [...prev, data] : [data, ...prev]);
    }
    setNewComment('');
    setNewSentiment(null);
    addAlert("Successfully posted comment", "success");
  };


  // const newSentimentCheckbox = (senti) => {
  //   return <label>
  //     <input
  //       type="checkbox"
  //       checked={senti == newSentiment}
  //       onChange={(e) => {
  //         if (e.target.checked) setNewSentiment(senti)
  //       }}
  //     />
  //     {senti}
  //   </label>
  // }
  const sentimentIcons = {
    up: "👍",
    neutral: "😐",
    down: "👎",
  };

  const newSentimentCheckbox = (senti) => {
    const isSelected = senti === newSentiment;

    return (
      <button
        type="button"
        onClick={() => setNewSentiment(isSelected ? null : senti)}
        className={`
        text-2xl
        cursor-pointer
        select-none
        transition
        p-1 rounded-full
        ${isSelected ? "bg-blue-100 text-blue-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"}
      `}
        aria-pressed={isSelected}
        aria-label={`Select sentiment ${senti}`}
        title={senti.charAt(0).toUpperCase() + senti.slice(1)}
      >
        {sentimentIcons[senti]}
      </button>
    );
  };

  return (
    <div className="mt-2 pl-2">
      {loginStatus && (
        <div className="mb-2 min-w-0">
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handlePostComment();
              }
            }}
            className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 flex-grow">
              <span className="text-base font-medium select-none">Sentiment:</span>
              {newSentimentCheckbox("up")}
              {newSentimentCheckbox("neutral")}
              {newSentimentCheckbox("down")}
            </div>
            <button
              onClick={handlePostComment}
              className="text-xs px-3 py-1 rounded cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition flex-shrink-0 ml-4"
            >
              Post
            </button>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-2">Comments</h2>

      <div className="flex items-center space-x-4 mb-4 text-sm">
        <label>
          Sentiment:{" "}
          <select
            name="sentiment"
            onChange={(e) => setSettings({ ...settings, sentiment: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1"
            value={settings.sentiment}
          >
            <option value="">All</option>
            <option value="up">Up</option>
            <option value="neutral">Neutral</option>
            <option value="down">Down</option>
          </select>
        </label>

        <label>
          Order:{" "}
          <select
            name="order"
            onChange={(e) => setSettings({ ...settings, ascending: e.target.value === 'true' })}
            className="border border-gray-300 rounded px-2 py-1"
            value={settings.ascending.toString()}
          >
            <option value="false">Latest to earliest</option>
            <option value="true">Earliest to latest</option>
          </select>
        </label>
      </div>

      <ul className="space-y-4">
        {comments.map((c, i) => (
          <li
            key={i}
            className="bg-gray-50 p-3 rounded shadow-sm border border-gray-200"
          >
            <div className="text-xs text-gray-600 mb-1 flex justify-between items-center">
              <span className="font-semibold text-gray-800">{c.username}</span>
              <span
                className={`capitalize font-medium ${c.sentiment === 'up' ? 'text-green-600' :
                  c.sentiment === 'down' ? 'text-red-600' :
                    'text-gray-500'
                  }`}
              >
                {c.sentiment}
              </span>
              <span>{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">• {c.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}


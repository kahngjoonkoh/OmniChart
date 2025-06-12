import { useState } from 'react';

export default function CommentSection({ comments, onAdd }) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (newComment.trim() !== '') {
      onAdd(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div style={{ marginTop: 10, paddingLeft: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          style={{
            flex: 1,
            fontSize: 12,
            padding: '4px 6px',
            border: '1px solid #ccc',
            borderRadius: 4,
          }}
        />
        <button
          onClick={handleSubmit}
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
      </div>

      {comments.map((c, i) => (
        <div key={i} style={{ fontSize: 12, marginBottom: 5, color: '#555' }}>
          • {c.content}
        </div>
      ))}
    </div>
  );
}


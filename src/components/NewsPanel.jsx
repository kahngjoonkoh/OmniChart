import CommentSection from './CommentSection';

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
  return (
    <div style={{ flex: 1, borderLeft: '1px solid #ccc', padding: 20, overflowY: 'auto' }}>
      {!id && (
        <div style={{ color: '#777', textAlign: 'center' }}>
          📰 Click or hover a colored chart area to view its related news event.
        </div>
      )}
      <h2>{title}</h2>
      <SplitNews news={news} />

      {source_url && (() => {
        try {
          const urlObj = new URL(source_url);
          const faviconUrl = `${urlObj.origin}/favicon.ico`;

          return (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 'bold' }}>Source: </span>

              <a
                href={source_url}
                target="_blank"
                rel="noopener noreferrer"
                title={source_url}
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
              >
                <img
                  src={faviconUrl}
                  alt="website favicon"
                  style={{ width: 18, height: 18, marginRight: 6, objectFit: 'contain' }}
                  onError={(e) => {
                    // fallback if favicon not found, hide image or replace with default icon
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Optional: Show domain text next to icon */}
                <span style={{ color: '#1a0dab', fontSize: '0.875rem' }}>{urlObj.hostname}</span>
              </a>
            </div>
          );
        } catch {
          // invalid URL fallback
          return null;
        }
      })()}


      {id && (
        <CommentSection id={id}/>
      )}
    </div>
  );
}

export default NewsPanel;
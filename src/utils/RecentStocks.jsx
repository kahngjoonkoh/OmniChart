export function addRecentStockQuery(query) {
  const key = 'recentStockQueries';
  let recent = JSON.parse(localStorage.getItem(key)) || [];

  query = query.trim();
  if (!query) return;

  // Remove duplicates
  recent = recent.filter(q => q.toLowerCase() !== query.toLowerCase());

  // Add to top
  recent.unshift(query);

  // Limit to last 5
  if (recent.length > 5) recent = recent.slice(0, 5);

  localStorage.setItem(key, JSON.stringify(recent));
}

export function getRecentStockQueries() {
  return JSON.parse(localStorage.getItem('recentStockQueries')) || [];
}

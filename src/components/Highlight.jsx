// Purpose: Wraps the words the user searched for in <mark> so they stand out.
// Used by: components/ItemCard.jsx

// Escape characters that have a special meaning inside a regular expression
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function Highlight({ text, query = '' }) {
  const words = query.trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (words.length === 0) return text;

  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  // split() with a capture group keeps the matched words in the array
  return text.split(pattern).map((part, index) =>
    index % 2 === 1 ? <mark key={index} className="highlight">{part}</mark> : part,
  );
}

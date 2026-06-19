import { useState, useMemo } from 'react';
import { useBooks } from '../hooks/useBooks';
import BookGrid from '../components/BookGrid';
import SearchBar from '../components/SearchBar';

export default function HomePage() {
  const { books, loading } = useBooks();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return books;
    const q = query.toLowerCase();
    return books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  }, [books, query]);

  if (loading) return <p style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>加载中...</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>书架</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        共 {books.length} 本书{query ? ` · 找到 ${filtered.length} 条结果` : ''}
      </p>
      <SearchBar value={query} onChange={setQuery} />
      <BookGrid books={filtered} />
    </div>
  );
}

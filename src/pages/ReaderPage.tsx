import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import EpubReader from '../components/EpubReader';
import PdfReader from '../components/PdfReader';
import type { Book } from '../types';

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/books.json')
      .then(r => r.json())
      .then((books: Book[]) => {
        const found = books.find(b => b.id === id);
        setBook(found ?? null);
      })
      .catch(() => setBook(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>加载中...</p>;
  if (!book) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ fontSize: '1.2rem' }}>未找到该书籍</p>
      <Link to="/" style={{ color: '#e94560' }}>返回首页</Link>
    </div>
  );

  const fileUrl = `/books/${book.filename}`;

  return (
    <div style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Link to="/" style={{ color: '#e94560', textDecoration: 'none' }}>← 返回</Link>
        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{book.title}</h2>
        {book.author && <span style={{ color: '#888', fontSize: '0.9rem' }}>— {book.author}</span>}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {book.format === 'epub' ? (
          <EpubReader url={fileUrl} />
        ) : (
          <PdfReader url={fileUrl} />
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import type { Book } from '../types';

interface Props { book: Book; }

export default function BookCard({ book }: Props) {
  const formatBadge = book.format === 'epub'
    ? { bg: '#16a34a', label: 'EPUB' }
    : { bg: '#2563eb', label: 'PDF' };

  return (
    <Link to={`/book/${book.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: '#1e1e32', borderRadius: 12, overflow: 'hidden',
        border: '1px solid #2a2a4a', transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
      >
        {/* 封面占位 */}
        <div style={{
          height: 200, background: 'linear-gradient(135deg, #2a2a5a 0%, #1a1a3a 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
        }}>
          📖
        </div>
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: '1rem', lineHeight: 1.3, flex: 1 }}>{book.title}</h3>
            <span style={{
              background: formatBadge.bg, color: '#fff', fontSize: '0.65rem',
              padding: '2px 6px', borderRadius: 4, marginLeft: 8, flexShrink: 0,
            }}>{formatBadge.label}</span>
          </div>
          {book.author && (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>{book.author}</p>
          )}
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#555' }}>
            {(book.fileSize / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
      </div>
    </Link>
  );
}

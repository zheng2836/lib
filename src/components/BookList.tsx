import { useState } from 'react';
import { deleteBook } from '../api/client';
import type { Book } from '../types';

interface Props { books: Book[]; onDeleted: () => void; }

export default function BookList({ books, onDeleted }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (book: Book) => {
    if (!confirm(`确定删除《${book.title}》？此操作不可撤销。`)) return;
    setDeleting(book.id);
    try {
      const res = await deleteBook(book.filename);
      if (res.ok) {
        onDeleted();
      } else {
        alert(`删除失败: ${res.error || '未知错误'}`);
      }
    } catch {
      alert('网络错误');
    } finally {
      setDeleting(null);
    }
  };

  if (books.length === 0) {
    return <p style={{ color: '#555', textAlign: 'center' }}>暂无书籍</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {books.map(book => (
        <div key={book.id} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#1e1e32', borderRadius: 8, padding: '1rem',
          border: '1px solid #2a2a4a',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1rem' }}>{book.title}</span>
              <span style={{
                background: book.format === 'epub' ? '#16a34a' : '#2563eb',
                color: '#fff', fontSize: '0.6rem', padding: '1px 5px', borderRadius: 3,
              }}>{book.format.toUpperCase()}</span>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#666' }}>
              {book.author || '未知作者'} · {(book.fileSize / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>
          <button
            onClick={() => handleDelete(book)}
            disabled={deleting === book.id}
            style={{
              padding: '0.4rem 1rem', background: '#dc2626', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              opacity: deleting === book.id ? 0.5 : 1,
            }}
          >
            {deleting === book.id ? '...' : '删除'}
          </button>
        </div>
      ))}
    </div>
  );
}


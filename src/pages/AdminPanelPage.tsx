import { useState } from 'react';
import UploadForm from '../components/UploadForm';
import BookList from '../components/BookList';
import { useBooks } from '../hooks/useBooks';

export default function AdminPanelPage() {
  const { books, loading, refresh } = useBooks();
  const [tab, setTab] = useState<'upload' | 'manage'>('upload');

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>管理面板</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        <button
          onClick={() => setTab('upload')}
          style={{
            flex: 1, padding: '0.6rem', borderRadius: 8, cursor: 'pointer',
            border: 'none', fontSize: '0.9rem',
            background: tab === 'upload' ? '#e94560' : '#1e1e32',
            color: tab === 'upload' ? '#fff' : '#aaa',
          }}
        >上传新书</button>
        <button
          onClick={() => setTab('manage')}
          style={{
            flex: 1, padding: '0.6rem', borderRadius: 8, cursor: 'pointer',
            border: 'none', fontSize: '0.9rem',
            background: tab === 'manage' ? '#e94560' : '#1e1e32',
            color: tab === 'manage' ? '#fff' : '#aaa',
          }}
        >管理书籍 ({books.length})</button>
      </div>

      {tab === 'upload' ? (
        <UploadForm onSuccess={refresh} />
      ) : (
        <div>
          {loading ? <p style={{ color: '#555' }}>加载中...</p> : <BookList books={books} onDeleted={refresh} />}
        </div>
      )}
    </div>
  );
}

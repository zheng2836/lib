import type { Book } from '../types';
import BookCard from './BookCard';

interface Props { books: Book[]; }

export default function BookGrid({ books }: Props) {
  if (books.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#555' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
        <p style={{ fontSize: '1.2rem' }}>书架空空如也</p>
        <p style={{ fontSize: '0.9rem' }}>管理员上传新书后，这里就会显示</p>
      </div>
    );
  }
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '1.5rem',
    }}>
      {books.map(b => <BookCard key={b.id} book={b} />)}
    </div>
  );
}

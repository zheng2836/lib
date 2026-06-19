import { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';

interface Props { url: string; }

export default function EpubReader({ url }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;
    const b = ePub(url);
    const r = b.renderTo(containerRef.current, {
      width: '100%', height: '100%', flow: 'paginated',
    });
    r.display();
    r.on('relocated', (loc: any) => {
      setCurrentPage(`${loc.start.percentage ? Math.round(loc.start.percentage * 100) : 0}%`);
    });
    setRendition(r);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') r.next();
      if (e.key === 'ArrowLeft') r.prev();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      b.destroy();
    };
  }, [url]);

  const goPrev = () => rendition?.prev();
  const goNext = () => rendition?.next();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ flex: 1, background: '#fff', borderRadius: 8, overflow: 'hidden' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
        <button onClick={goPrev} style={btnStyle}>◀ 上一页</button>
        <span style={{ color: '#888', fontSize: '0.85rem' }}>{currentPage}</span>
        <button onClick={goNext} style={btnStyle}>下一页 ▶</button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '0.5rem 1.5rem', background: '#e94560', color: '#fff',
  border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.9rem',
};

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Props { url: string; }

export default function PdfReader({ url }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);

  useEffect(() => {
    let cancelled = false;
    const loadPdf = async () => {
      const pdf = await pdfjsLib.getDocument({ url }).promise;
      if (cancelled) return;
      setNumPages(pdf.numPages);

      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '1rem';
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.display = 'block';
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        wrapper.appendChild(canvas);
        container.appendChild(wrapper);
        const ctx = canvas.getContext('2d');
        if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        if (cancelled) return;
      }
    };
    loadPdf();
    return () => { cancelled = true; };
  }, [url, scale]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '0.75rem' }}>
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} style={btnStyle}>−</button>
        <span style={{ color: '#888', fontSize: '0.85rem' }}>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(3, s + 0.25))} style={btnStyle}>+</button>
        <span style={{ color: '#555', fontSize: '0.8rem', marginLeft: 'auto' }}>共 {numPages} 页</span>
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1, overflowY: 'auto', background: '#222',
          borderRadius: 8, padding: '1rem',
        }}
      />
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '0.3rem 0.8rem', background: '#2a2a4a', color: '#eee',
  border: '1px solid #3a3a5a', borderRadius: 4, cursor: 'pointer',
};

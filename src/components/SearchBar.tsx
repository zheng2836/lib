import { useState } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: '2rem' }}>
      <input
        type="text"
        placeholder="搜索书名或作者..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', maxWidth: 400, padding: '0.75rem 1rem',
          background: '#1e1e32', border: `1px solid ${focused ? '#e94560' : '#2a2a4a'}`,
          borderRadius: 8, color: '#eee', fontSize: '1rem',
          outline: 'none', transition: 'border-color 0.2s',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

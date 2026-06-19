import { useState, useRef } from 'react';
import { uploadBook } from '../api/client';

interface Props { onSuccess: () => void; }

export default function UploadForm({ onSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext !== 'epub' && ext !== 'pdf') {
      setMsg('只支持 .epub 和 .pdf 格式');
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.(epub|pdf)$/i, ''));
  };

  const handleSubmit = async () => {
    if (!file) { setMsg('请先选择文件'); return; }
    if (!title.trim()) { setMsg('请填写书名'); return; }
    setLoading(true);
    setMsg('正在编码文件...');
    try {
      setMsg('正在上传...');
      const res = await uploadBook(file, title.trim(), author.trim(), desc.trim());
      if (res.ok) {
        setMsg('✅ 上传成功！CF Pages 将在约1-2分钟后自动更新');
        setFile(null); setTitle(''); setAuthor(''); setDesc('');
        if (fileRef.current) fileRef.current.value = '';
        onSuccess();
      } else {
        setMsg(`❌ ${res.error || '上传失败'}`);
      }
    } catch (e: any) {
      setMsg(`❌ 网络错误: ${e.message || '连接中断，请重试'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#1e1e32', borderRadius: 12, padding: '1.5rem', border: '1px solid #2a2a4a' }}>
      <h3 style={{ margin: '0 0 1rem' }}>上传新书</h3>

      {/* 拖拽区 */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={e => { e.preventDefault(); e.stopPropagation(); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: '2px dashed #3a3a5a', borderRadius: 8, padding: '2rem',
          textAlign: 'center', cursor: 'pointer', marginBottom: '1rem',
          transition: 'border-color 0.2s',
          background: file ? '#16a34a22' : 'transparent',
        }}
      >
        {file ? (
          <div>
            <div style={{ fontSize: '2rem' }}>📄</div>
            <p style={{ margin: '0.5rem 0', color: '#16a34a' }}>{file.name}</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
              {(file.size / 1024 / 1024).toFixed(1)} MB · 点击更换
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '2rem' }}>⬆️</div>
            <p style={{ margin: '0.5rem 0' }}>点击或拖拽文件到此处</p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>支持 .epub / .pdf，最大 25 MB</p>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".epub,.pdf"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* 表单 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input
          value={title} onChange={e => setTitle(e.target.value)}
          placeholder="书名 *"
          style={inputStyle}
        />
        <input
          value={author} onChange={e => setAuthor(e.target.value)}
          placeholder="作者"
          style={inputStyle}
        />
        <textarea
          value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="简介"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {msg && (
        <p style={{ margin: '1rem 0 0', fontSize: '0.85rem', color: msg.startsWith('✅') ? '#16a34a' : msg.startsWith('❌') ? '#ef4444' : '#aaa' }}>
          {msg}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: '1rem', width: '100%', padding: '0.75rem',
          background: loading ? '#555' : '#e94560', color: '#fff',
          border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem', fontWeight: 'bold',
        }}
      >
        {loading ? '上传中...' : '上传'}
      </button>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '0.65rem 0.8rem', background: '#0f0f1a',
  border: '1px solid #2a2a4a', borderRadius: 6,
  color: '#eee', fontSize: '0.9rem', outline: 'none',
};

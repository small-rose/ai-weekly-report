'use client';

import { useState } from 'react';

export default function HomePage() {
  const [input, setInput] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('请输入本周工作内容');
      return;
    }
    setError('');
    setLoading(true);
    setReport('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '生成失败，请稍后重试');
        return;
      }

      setReport(data.report);
    } catch (err) {
      setError('网络错误，请检查网络');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>🤖 AI 周报生成器</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        输入本周工作内容，AI 自动整理成专业周报
      </p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="例如：完成了用户登录模块开发，参与了3次产品需求评审，修复了5个前端bug..."
        rows={6}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #ddd',
          fontSize: '16px',
          marginBottom: '12px',
        }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '生成中...' : '生成周报'}
      </button>

      {report && (
        <div style={{ marginTop: '24px' }}>
          <h2>📝 你的周报：</h2>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #eee',
              marginBottom: '12px',
            }}
          >
            {report}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(report)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            复制内容
          </button>
        </div>
      )}

      <footer style={{ marginTop: '40px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
        ⚡ 完全免费 · 数据不存储 · 基于 AI 自动生成
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Lock, Clock, Calendar, Copy, Check, ChevronLeft, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SnippetViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [password, setPassword] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/snippet/${id}`);
      setSnippet(response.data);
      setIsProtected(response.data.isProtected);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch snippet');
      setLoading(false);
    }
  };

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/api/snippet/${id}/verify`, { password });
      setSnippet({ ...snippet, code: response.data.code });
      setIsProtected(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid password');
    }
  };

  const copyToClipboard = () => {
    if (snippet?.code) {
      navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <div className="container loader-container">
      <div className="loader"></div>
      <p>Unlocking your snippet...</p>
    </div>
  );

  if (error && !isProtected) return (
    <div className="container viewer-page">
      <div className="glass-card text-center mx-auto" style={{ maxWidth: '500px' }}>
        <h2 className="text-danger">Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary mt-4">Go Home</button>
      </div>
    </div>
  );

  return (
    <div className="container viewer-page">
      <div className="viewer-header">
        <button className="btn btn-text" onClick={() => navigate('/')}>
          <ChevronLeft size={18} /> Back to Vault
        </button>
        {snippet && (
          <div className="snippet-meta">
            <span><Calendar size={14} /> {new Date(snippet.createdAt).toLocaleDateString()}</span>
            <span className="badge">{snippet.language}</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isProtected ? (
          <motion.div 
            key="protected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="auth-card glass-card mx-auto"
            style={{ maxWidth: '400px' }}
          >
            <div className="auth-header text-center mb-6">
              <div className="icon-circle mx-auto mb-4">
                <Lock size={32} className="text-accent" />
              </div>
              <h2>Protected</h2>
              <p>Password required to decrypt.</p>
            </div>
            <form onSubmit={handleVerifyPassword}>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  autoFocus
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-danger mb-4 text-center">{error}</p>}
              <button type="submit" className="btn btn-primary btn-block">
                Unlock Snippet
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="viewer-container"
          >
            <div className="viewer-actions glass-card mb-6">
              <div className="viewer-info">
                <h3>Snippet <span>Vault</span></h3>
                <p>Viewing protected content</p>
              </div>
              <button onClick={copyToClipboard} className="btn btn-outline">
                {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <div className="viewer-content glass-card overflow-hidden p-0">
              <SyntaxHighlighter 
                language={snippet?.language || 'javascript'} 
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '2.5rem',
                  fontSize: '1rem',
                  background: 'transparent',
                  lineHeight: '1.7'
                }}
              >
                {snippet?.code || ''}
              </SyntaxHighlighter>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SnippetViewer;

import React, { useState, useEffect } from 'react';
import api from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Clock, Calendar, Copy, Check, ChevronLeft, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SnippetViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSnippet();
  }, [id]);

  const fetchSnippet = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/snippet/${id}`);
      setSnippet(response.data);

      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch snippet');
      setLoading(false);
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

  if (error) return (
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
    </div>
  );
};

export default SnippetViewer;

import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Share2, Copy, Check, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const SnippetEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  


  const { user } = useAuth();
  const navigate = useNavigate();



  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/create', {
        code,
        language,
      });

      const { shortId } = response.data;
      const link = `${window.location.origin}/snippet/${shortId}`;
      setGeneratedLink(link);
    } catch (error) {
      console.error('Error creating snippet:', error);
      alert('Failed to create snippet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (generatedLink) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="link-card container"
      >
        <div className="card">
          <div className="card-header">
            <Check className="text-success" />
            <h2>Snippet Created!</h2>
          </div>
          <p>Your snippet is ready to share. Anyone with this link can view it.</p>
          <div className="link-box">
            <input type="text" readOnly value={generatedLink} />
            <button onClick={copyToClipboard} className="btn btn-primary">
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="card-footer">
            <button onClick={() => setGeneratedLink('')} className="btn btn-outline">Create Another</button>
            <button onClick={() => navigate(`/snippet/${generatedLink.split('/').pop()}`)} className="btn btn-primary">View Snippet</button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="container editor-page">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="editor-header"
      >
        <h1>Craft your <span>Snippet</span></h1>
        <p>Elevate your code sharing experience today.</p>
        {user && (
          <div className="user-badge glass-card">
            <User size={14} /> Shared as {user.email}
          </div>
        )}
      </motion.div>

      <div className="main-layout">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="editor-section glass-card"
        >
          <div className="editor-controls">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="lang-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your brilliant code here..."
            spellCheck="false"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="settings-section glass-card"
        >
          <h3>Snippet Settings</h3>
          




          {/* Individual password protection removed per user request */}

          <button 
            className="btn btn-primary btn-block" 
            onClick={handleSubmit}
            disabled={isSubmitting || !code}
          >
            <Share2 size={18} /> {isSubmitting ? 'Generating...' : 'Generate Vault Link'}
          </button>

          {generatedLink && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="result-box glass-card"
            >
              <p>Your link is ready:</p>
              <div className="link-copy">
                <input readOnly value={generatedLink} />
                <button onClick={copyToClipboard} className="btn-icon">
                  {copied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

    </div>
  );
};

export default SnippetEditor;

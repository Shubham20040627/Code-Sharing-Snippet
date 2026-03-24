import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { Share2, Clock, Lock, Copy, Check, User, FolderPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ProjectModal from './ProjectModal';

const SnippetEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [password, setPassword] = useState('');
  const [expiryHours, setExpiryHours] = useState(24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Project related state
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/create', {
        code,
        language,
        password: password || null,
        expiryHours: parseInt(expiryHours),
        projectId: selectedProjectId || null
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

  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject]);
    setSelectedProjectId(newProject._id);
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
          
          <div className="form-group">
            <label><Clock size={16} /> Expiry</label>
            <select value={expiryHours} onChange={(e) => setExpiryHours(e.target.value)}>
              <option value="1">1 Hour</option>
              <option value="24">24 Hours</option>
              <option value="168">7 Days</option>
              <option value="0">Never</option>
            </select>
          </div>

          {user && (
            <div className="form-group">
              <label><FolderPlus size={16} /> Project Folder</label>
              <div className="flex-group">
                <select 
                  value={selectedProjectId} 
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                  <option value="">No Project</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  className="btn-icon" 
                  onClick={() => setIsProjectModalOpen(true)}
                  title="New Project"
                >
                  <PlusIcon size={18} />
                </button>
              </div>
            </div>
          )}

          {!selectedProjectId ? (
            <div className="form-group">
              <label><Lock size={16} /> Protection (Optional)</label>
              <input 
                type="password" 
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="text-muted"><Lock size={16} /> Protection</label>
              <div className="info-box glass-card">
                <p>This snippet will use the folder's password protection.</p>
              </div>
            </div>
          )}

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

      <ProjectModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

// Simple Plus icon if not imported
const PlusIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default SnippetEditor;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Folder, Lock, Unlock, Calendar, ExternalLink, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ProjectViewer = () => {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [snippets, setSnippets] = useState([]);
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [shortId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/project/shared/${shortId}`);
      setProject(response.data.project);
      setIsProtected(response.data.isProtected);
      if (!response.data.isProtected) {
        setSnippets(response.data.snippets);
      }
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch project');
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/project/shared/${shortId}/verify`, { password });
      setSnippets(response.data.snippets);
      setIsProtected(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid password');
    }
  };

  if (loading) return (
    <div className="container loader-container">
      <div className="loader"></div>
      <p>Unlocking the folder...</p>
    </div>
  );

  return (
    <div className="container viewer-page">
      <div className="viewer-header">
        <button className="btn btn-text" onClick={() => navigate('/')}>
          <ChevronLeft size={18} /> Back Home
        </button>
        {project && (
          <div className="snippet-meta">
            <span><Folder size={14} /> Shared Project</span>
            <span className="badge-premium">{project.name}</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isProtected ? (
          <motion.div 
            key="protected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="auth-card glass-card mx-auto"
            style={{ maxWidth: '400px' }}
          >
            <div className="auth-header text-center mb-6">
              <div className="icon-circle mx-auto mb-4">
                <Lock size={32} className="text-accent" />
              </div>
              <h2>Protected Folder</h2>
              <p>Enter the project password to view its contents.</p>
            </div>
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label>Folder Password</label>
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
                Access Folder
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="project-viewer-container"
          >
            <div className="viewer-actions glass-card mb-8">
              <div className="viewer-info">
                <h3>{project?.name}</h3>
                <p>{project?.description || 'A shared collection of brilliant code snippets.'}</p>
              </div>
              <div className="badge-premium">
                {snippets.length} Snippets
              </div>
            </div>

            <div className="shared-snippets-list">
              {snippets.map((snippet, index) => (
                <motion.div 
                  key={snippet._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="shared-snippet-item glass-card mb-8"
                >
                  <div className="snippet-card-header mb-4">
                    <span className="badge">{snippet.language}</span>
                    <span className="date"><Calendar size={14} /> {new Date(snippet.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="viewer-content overflow-hidden p-0 mb-4">
                    <SyntaxHighlighter 
                      language={snippet.language} 
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.9rem',
                        background: 'transparent',
                        maxHeight: '400px'
                      }}
                    >
                      {snippet.code}
                    </SyntaxHighlighter>
                  </div>
                  <div className="text-right">
                    <button 
                      className="btn btn-small btn-text"
                      onClick={() => navigate(`/snippet/${snippet.shortId}`)}
                    >
                      View Separately <ExternalLink size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectViewer;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Folder, Calendar, ExternalLink, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ProjectViewer = () => {
  const { shortId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [snippets, setSnippets] = useState([]);
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
      setSnippets(response.data.snippets);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch project');
      setLoading(false);
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
    </div>
  );
};

export default ProjectViewer;

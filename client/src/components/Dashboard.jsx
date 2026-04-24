import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Code2, ExternalLink, Trash2, Calendar, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const snippetsRes = await api.get('/auth/my-snippets');
      setSnippets(snippetsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSnippet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    try {
      await api.delete(`/snippet/${id}`);
      setSnippets(snippets.filter(s => s._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.error || 'Failed to delete snippet');
    }
  };

  const filteredSnippets = snippets.filter(s => {
    return s.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
           s.language.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return (
    <div className="container loader-container">
      <div className="loader"></div>
      <p>Organizing your vault...</p>
    </div>
  );

  return (
    <div className="container dashboard-page">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header"
      >
        <div>
          <h1>Your <span>Vault</span></h1>
          <p>Welcome back, {user?.email.split('@')[0]}. You have {snippets.length} snippets.</p>
        </div>
        <div className="header-actions">

          <Link to="/create" className="btn btn-primary">
            <Plus size={18} /> New Snippet
          </Link>
        </div>
      </motion.div>

      <div className="dashboard-layout">
        <main className="dashboard-main">
          <div className="section-header">
            <h2>Recent Snippets</h2>
            <div className="dashboard-controls">
              <div className="search-bar glass-card">
                <Search size={18} />
                <input 
                  type="text" 
                  placeholder="Search snippets..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="snippets-grid">
            <AnimatePresence mode="popLayout">
              {filteredSnippets.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="empty-state glass-card"
                >
                  <Code2 size={48} />
                  <p>No snippets found in this category.</p>
                  <Link to="/create" className="btn btn-outline">Create a snippet</Link>
                </motion.div>
              ) : (
                filteredSnippets.map((snippet, index) => (
                  <motion.div 
                    layout
                    key={snippet._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="snippet-card glass-card"
                  >
                    <div className="snippet-card-header">
                      <span className="badge">{snippet.language}</span>
                      <span className="date"><Calendar size={14} /> {new Date(snippet.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="snippet-preview">
                      {snippet.code.substring(0, 120)}...
                    </div>
                    <div className="snippet-actions">
                      <Link to={`/snippet/${snippet.shortId}`} className="btn btn-small btn-outline">
                        <ExternalLink size={14} /> View
                      </Link>
                      <button onClick={() => deleteSnippet(snippet._id)} className="btn btn-small btn-text text-danger">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>


    </div>
  );
};

export default Dashboard;

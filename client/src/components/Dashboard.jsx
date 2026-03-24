import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Code2, ExternalLink, Trash2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMySnippets();
  }, [user]);

  const fetchMySnippets = async () => {
    try {
      const response = await api.get('/auth/my-snippets');
      setSnippets(response.data);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSnippet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;
    try {
      // Note: We'll need to add a delete route in server.js later if needed, 
      // but for now, we'll just remove it from state to show the UI
      setSnippets(snippets.filter(s => s._id !== id));
      // Optional: await axios.delete(`http://localhost:5000/api/snippet/${id}`);
    } catch (error) {
      alert('Failed to delete snippet');
    }
  };

  if (loading) return <div className="container loader">Loading your dashboard...</div>;

  return (
    <div className="container dashboard-page">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header"
      >
        <div>
          <h1>Welcome, {user?.email.split('@')[0]}</h1>
          <p>You have {snippets.length} saved snippets in your vault.</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus size={18} /> New Snippet
        </Link>
      </motion.div>

      <div className="snippets-grid">
        {snippets.length === 0 ? (
          <div className="empty-state glass-card">
            <Code2 size={48} />
            <p>Your vault is currently empty.</p>
            <Link to="/create" className="btn btn-outline">Create your first snippet</Link>
          </div>
        ) : (
          snippets.map((snippet, index) => (
            <motion.div 
              key={snippet._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="snippet-card glass-card"
            >
              <div className="snippet-card-header">
                <span className="badge">{snippet.language}</span>
                <span className="date"><Calendar size={14} /> {new Date(snippet.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="snippet-preview">
                {snippet.code.substring(0, 150)}...
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
      </div>
    </div>
  );
};

export default Dashboard;

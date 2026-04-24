import React, { useState } from 'react';
import { X, FolderPlus, AlignLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const ProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/projects', {
        name,
        description
      });
      onProjectCreated(response.data);
      onClose();
      // Reset form
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="modal-content glass-card"
      >
        <div className="modal-header">
          <h2><FolderPlus size={24} className="text-accent" /> New Project</h2>
          <button onClick={onClose} className="btn-icon"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input 
              type="text" 
              placeholder="e.g., Python Basics" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label><AlignLeft size={16} /> Description (Optional)</label>
            <textarea 
              placeholder="What belongs in this project?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
            />
          </div>



          {error && <p className="error-msg">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-text">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !name}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProjectModal;

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Sparkles, MoveRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container auth-page">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="auth-split-card"
      >
        <div className="auth-hero">
          <div className="auth-hero-content">
            <motion.div variants={itemVariants}>
              <div className="badge-premium"><Sparkles size={14} /> Welcome back</div>
              <h1>Access your <span>Snippet Vault.</span></h1>
              <p>Manage your code collections, shared links, and secure snippets from your personal dashboard.</p>
            </motion.div>
          </div>
        </div>

        <div className="auth-form-container">
          <motion.div variants={itemVariants}>
            <h2>Sign In</h2>
            <p>Enter your credentials to continue</p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="form-group">
              <label><Mail size={16} /> Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="form-group">
              <label><Lock size={16} /> Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>

            {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-danger error-msg">{error}</motion.p>}

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading}
            >
              <LogIn size={18} /> {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="auth-footer">
            Don't have an account? <Link to="/signup">Create one <MoveRight size={14} /></Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

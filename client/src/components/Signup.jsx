import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user && (user.id || user._id)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/signup', { email, password });
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
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
              <div className="badge-premium"><Sparkles size={14} /> Join the elite</div>
              <h1>Shared coding, <span>Elevated.</span></h1>
              <p>Create, share, and manage your code snippets with premium glassmorphic interface and rock-solid security.</p>
            </motion.div>
            
            <motion.ul variants={itemVariants} className="hero-features">
              <li><CheckCircle2 size={18} /> Syntax highlighting for 50+ languages</li>
              <li><CheckCircle2 size={18} /> Password-protected secure links</li>
              <li><CheckCircle2 size={18} /> Personalized developer dashboard</li>
            </motion.ul>
          </div>
        </div>

        <div className="auth-form-container">
          <motion.div variants={itemVariants}>
            <h2>Create Account</h2>
            <p>Start sharing your brilliance today</p>
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
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="form-group">
              <label><Lock size={16} /> Confirm Password</label>
              <input 
                type="password" 
                required 
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Get Started'}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="auth-footer">
            Already a member? <Link to="/login">Sign in</Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

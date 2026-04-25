import express from 'express';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import Snippet from '../models/Snippet.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  console.log('Signup hit with body:', { ...req.body, password: '***' });
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email: normalizedEmail, password: hashedPassword });
    await user.save();
    
    const token = sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    res.status(201).json({ user: { email: user.email, id: user._id }, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message || 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const token = sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    res.json({ user: { email: user.email, id: user._id }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: error.message || 'Login failed' });
  }
});

// Get user's snippets (Protected)
router.get('/my-snippets', auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(snippets);
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

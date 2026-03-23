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
  console.log('Signup hit with body:', req.body);
  try {
    const { email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    
    const token = sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    res.status(201).send({ user: { email: user.email, id: user._id }, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).send({ error: error.message || 'Signup failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: 'Invalid login credentials' });
    }

    const token = sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    res.send({ user: { email: user.email, id: user._id }, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get user's snippets (Protected)
router.get('/my-snippets', auth, async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.send(snippets);
  } catch (error) {
    res.status(500).send();
  }
});

export default router;

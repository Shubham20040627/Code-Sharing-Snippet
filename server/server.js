import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import Snippet from './models/Snippet.js';
import Project from './models/Project.js';
import authRoutes from './routes/authRoutes.js';
import { auth } from './middleware/auth.js';
import pkg from 'jsonwebtoken';
const { verify } = pkg;

dotenv.config();

const app = express();

// Production CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ FATAL: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// MongoDB Connection with improved stability and logging
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // On Render, we want to know if it's a timeout or auth error
    if (err.message.includes('timeout')) {
      console.log('TIP: Check your MongoDB Atlas Network Access (IP Whitelist).');
    }
  }
};

connectDB();

// Create a snippet
app.post('/api/create', async (req, res) => {
  try {
    const { code, language, expiryHours, projectId } = req.body;
    
    // Optional user authentication
    let userId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        userId = decoded._id;
      } catch (e) {
        // Token is invalid, but we'll still allow anonymous creation
      }
    }

    if (!code) {
      return res.status(400).json({ error: 'Code content is required' });
    }

    const shortId = nanoid(10);
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let expiresAt = null;
    if (expiryHours) {
      expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    }

    const newSnippet = new Snippet({
      shortId,
      user: userId,
      project: projectId || null,
      code,
      language: language || 'javascript',
      password: null, // Snippet-level password removed
      expiresAt
    });

    await newSnippet.save();

    res.status(201).json({ 
      shortId,
      message: 'Snippet created successfully'
    });
  } catch (error) {
    console.error('Error creating snippet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a snippet by ID
app.get('/api/snippet/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ shortId: req.params.id });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found or expired' });
    }

    // Optional user authentication to check if user is the owner
    let isOwner = false;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const decoded = verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        if (snippet.user && snippet.user.toString() === decoded._id) {
          isOwner = true;
        }
      } catch (e) {
        // Token is invalid, treat as anonymous
      }
    }

    // Check if password protected (bypass if owner)
    // If snippet belongs to a project, check project password too
    let projectProtected = false;
    if (snippet.project) {
      const project = await Project.findById(snippet.project);
      if (project && project.password && !isOwner) {
        projectProtected = true;
      }
    }

    const isProtected = projectProtected && !isOwner;

    res.status(200).json({
      code: isProtected ? null : snippet.code,
      language: snippet.language,
      isProtected,
      createdAt: snippet.createdAt
    });
  } catch (error) {
    console.error('Error fetching snippet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify password for a snippet
app.post('/api/snippet/:id/verify', async (req, res) => {
  try {
    const { password } = req.body;
    const snippet = await Snippet.findOne({ shortId: req.params.id });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Snippet-level password removed, checking only project password
    if (snippet.project) {
      const project = await Project.findById(snippet.project);
      if (project && project.password) {
        const isProjectMatch = await bcrypt.compare(password, project.password);
        if (!isProjectMatch) {
          return res.status(401).json({ error: 'Invalid project password' });
        }
        return res.status(200).json({ code: snippet.code });
      }
    }
    
    // Fallback if somehow requested but no protection exists
    res.status(200).json({ code: snippet.code });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Delete a snippet
app.delete("/api/snippet/:id", auth, async (req, res) => {
  try {
    const snippet = await Snippet.findOne({ _id: req.params.id, owner: req.user._id });
    if (!snippet) {
      return res.status(404).json({ error: "Snippet not found or unauthorized" });
    }
    await Snippet.deleteOne({ _id: req.params.id });
    res.json({ message: "Snippet deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// Project Routes
app.post("/api/projects", auth, async (req, res) => {
  try {
    const { name, description, password } = req.body;
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const project = new Project({
      name,
      description,
      password: hashedPassword,
      owner: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "A project with this name already exists" });
    }
    res.status(400).json({ error: error.message || "Failed to create project" });
  }
});

app.get("/api/projects", auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/projects/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, owner: req.user._id });
    if (!project) return res.status(404).json({ error: "Project not found" });
    const snippets = await Snippet.find({ project: project._id });
    res.json({ project, snippets });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


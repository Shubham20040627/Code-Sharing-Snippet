import mongoose from 'mongoose';
import { nanoid } from 'nanoid';


const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  password: {
    type: String,
    default: null
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
    default: () => nanoid(12)
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// A user shouldn't have two projects with the same name
projectSchema.index({ name: 1, owner: 1 }, { unique: true });

const Project = mongoose.model('Project', projectSchema);

export default Project;

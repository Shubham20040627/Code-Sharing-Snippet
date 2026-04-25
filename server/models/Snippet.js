import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    default: 'javascript'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});



const Snippet = mongoose.model('Snippet', snippetSchema);

export default Snippet;

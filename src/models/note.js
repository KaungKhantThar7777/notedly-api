const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    author: {
      type: String,
      ref: 'User',
      required: true
    },
    favoriteCount: {
      type: Number,
      default: 0
    },
    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
  },
  {
    timestamps: true
  }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;

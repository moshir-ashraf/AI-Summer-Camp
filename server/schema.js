const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    default: 'STUDENT',
    required: true
  },
  password: {
    type: String,
    required: function () {
      return this.role === 'INSTRUCTOR';
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

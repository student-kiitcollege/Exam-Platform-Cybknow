const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  answer: { type: String, default: '' },
});

const snapshotSchema = new mongoose.Schema({
  image: { type: String, required: true }, // base64 string or image URL
  timestamp: { type: Date, default: Date.now },
});

const submissionSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true },
  answers: {
    type: [answerSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Answers array cannot be empty'],
  },
  snapshots: {
    type: [snapshotSchema],
    default: [],
  },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Submission', submissionSchema);

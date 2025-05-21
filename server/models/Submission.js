const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { 
    type: String, 
    required: true 
  },
  answer: { 
    type: String, 
    required: false, 
    default: ''  // Allow empty answers (e.g., skipped questions)
  }
});

const submissionSchema = new mongoose.Schema({
  studentEmail: { 
    type: String, 
    required: true 
  },
  answers: {
    type: [answerSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Answers array cannot be empty']  // Ensure at least one answer
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Submission', submissionSchema);

const Submission = require('../models/Submission');
const Question = require('../models/Question'); // Make sure you have this model

// Submit exam answers
exports.submitExam = async (req, res) => {
  try {
    const { studentEmail, answers } = req.body;

    if (!studentEmail || typeof studentEmail !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing studentEmail' });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be an array' });
    }

    if (answers.length === 0) {
      return res.status(400).json({ error: 'Answers array cannot be empty' });
    }

    // Normalize answers to ensure 'answer' is always a string (even empty)
    const normalizedAnswers = answers.map(ans => {
      if (!ans.questionId || typeof ans.questionId !== 'string') {
        throw new Error('Each answer must have a valid questionId string');
      }

      return {
        questionId: ans.questionId,
        answer: typeof ans.answer === 'string' ? ans.answer : '',
      };
    });

    const submission = new Submission({
      studentEmail,
      answers: normalizedAnswers,
      submittedAt: new Date(),
    });

    await submission.save();

    return res.status(200).json({ message: 'Submission successful' });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Get submission by student email
exports.getSubmissionByStudent = async (req, res) => {
  try {
    const { studentEmail } = req.params;

    if (!studentEmail) {
      return res.status(400).json({ error: 'Missing studentEmail parameter' });
    }

    const submission = await Submission.findOne({ studentEmail });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found for this student' });
    }

    return res.status(200).json(submission);
  } catch (error) {
    console.error('Error fetching submission by student:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get all submissions (admin) - UPDATED TO INCLUDE QUESTION DETAILS
exports.getAllSubmissions = async (req, res) => {
  try {
    // Fetch all submissions
    const submissions = await Submission.find();

    // Collect unique questionIds from all answers
    const questionIdsSet = new Set();
    submissions.forEach(sub => {
      sub.answers.forEach(ans => {
        questionIdsSet.add(ans.questionId);
      });
    });

    const questionIds = Array.from(questionIdsSet);

    // Fetch questions matching these IDs
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Create a map for quick lookup by questionId
    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    // Attach question details to each answer in submissions
    const enrichedSubmissions = submissions.map(sub => {
      const enrichedAnswers = sub.answers.map(ans => {
        const q = questionMap[ans.questionId];
        return {
          ...ans._doc,
          question: q
            ? {
                _id: q._id,
                questionText: q.questionText,
                correctAnswer: q.correctAnswer,
              }
            : null,
        };
      });

      return {
        ...sub._doc,
        answers: enrichedAnswers,
      };
    });

    return res.status(200).json(enrichedSubmissions);
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const Submission = require('../models/Submission');

exports.submitExam = async (req, res) => {
  try {
    const { studentEmail, answers } = req.body;

    if (!studentEmail || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid submission data' });
    }

    const newSubmission = new Submission({ studentEmail, answers });
    await newSubmission.save();

    res.status(201).json({ message: 'Exam submitted successfully' });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ message: 'Failed to submit exam' });
  }
};

exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('answers.questionId'); 

    const formatted = submissions.map(sub => ({
      ...sub._doc,
      answers: sub.answers.map(ans => ({
        ...ans._doc,
        question: ans.questionId
      }))
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

exports.getSubmissionByStudent = async (req, res) => {
  try {
    const { studentEmail } = req.params;
    const submission = await Submission.findOne({ studentEmail })
      .populate('answers.questionId');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const formatted = {
      ...submission._doc,
      answers: submission.answers.map(ans => ({
        ...ans._doc,
        question: ans.questionId
      }))
    };

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({ message: 'Failed to fetch submission' });
  }
};

const Submission = require('../models/Submission');
const Question = require('../models/Question');

exports.submitExam = async (req, res) => {
  try {
    const { studentEmail, answers, snapshots, examStartTime } = req.body;

    if (!studentEmail || typeof studentEmail !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing studentEmail' });
    }
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Answers must be a non-empty array' });
    }
    if (!examStartTime) {
      return res.status(400).json({ error: 'Missing examStartTime' });
    }

    const normalizedAnswers = answers.map(ans => ({
      questionId: ans.questionId,
      answer: typeof ans.answer === 'string' ? ans.answer : '',
    }));

    const normalizedSnapshots = Array.isArray(snapshots)
      ? snapshots.map(snap => ({
          image: typeof snap.image === 'string' ? snap.image : '',
          timestamp: snap.timestamp ? new Date(snap.timestamp) : new Date(),
        }))
      : [];

    const submission = new Submission({
      studentEmail,
      examStartTime: new Date(examStartTime),
      answers: normalizedAnswers,
      snapshots: normalizedSnapshots,
      submittedAt: new Date(),
    });

    await submission.save();

    return res.status(200).json({ message: 'Submission successful' });
  } catch (error) {
    console.error('Error submitting exam:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

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

exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find();

    const questionIdsSet = new Set();
    submissions.forEach(sub => {
      sub.answers.forEach(ans => {
        questionIdsSet.add(ans.questionId);
      });
    });

    const questionIds = Array.from(questionIdsSet);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

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

      const duration =
        sub.submittedAt && sub.examStartTime
          ? Math.floor((new Date(sub.submittedAt) - new Date(sub.examStartTime)) / 60000)
          : null;

      return {
        ...sub._doc,
        answers: enrichedAnswers,
        snapshots: sub.snapshots.map(snap => ({
          image: snap.image,
          timestamp: snap.timestamp,
        })),
        duration,
      };
    });

    return res.status(200).json(enrichedSubmissions);
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubmission = await Submission.findByIdAndDelete(id);
    if (!deletedSubmission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    return res.status(200).json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

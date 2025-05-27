const Submission = require('../models/Submission');
const Question = require('../models/Question');

exports.submitExam = async (req, res) => {
  try {
    const { studentEmail, answers, snapshots, examStartTime } = req.body;

    if (!studentEmail || typeof studentEmail !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing studentEmail' });
    }
    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers must be an array' });
    }
    if (!examStartTime) {
      return res.status(400).json({ error: 'Missing examStartTime' });
    }

    const questions = await Question.find({ assignedTo: studentEmail });

    const answerMap = {};
    answers.forEach(ans => {
      if (ans.questionId) {
        answerMap[ans.questionId] = typeof ans.answer === 'string' ? ans.answer.trim() : '';
      }
    });

    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    let penaltyUsed = 0;

    const evaluatedAnswers = questions.map(q => {
      const qId = q._id.toString();
      const studentAnswer = answerMap[qId] || '';
      let score = 0;

      if (!studentAnswer) {
        score = 0;
        unattemptedCount++;
      } else if (
        q.correctAnswer &&
        q.correctAnswer.toString().trim().toLowerCase() === studentAnswer.toLowerCase()
      ) {
        score = 1;
        correctCount++;
      } else {
        if (penaltyUsed < 3) {
          score = -1;
          wrongCount++;
          penaltyUsed++;
        } else {
          score = 0;
          wrongCount++;
        }
      }

      return {
        questionId: q._id,
        answer: studentAnswer,
        score,
      };
    });

    const normalizedSnapshots = Array.isArray(snapshots)
      ? snapshots.map(snap => ({
          image: typeof snap.image === 'string' ? snap.image : '',
          timestamp: snap.timestamp ? new Date(snap.timestamp) : new Date(),
        }))
      : [];

    const submission = new Submission({
      studentEmail,
      examStartTime: new Date(examStartTime),
      answers: evaluatedAnswers,
      snapshots: normalizedSnapshots,
      submittedAt: new Date(),
    });

    await submission.save();

    const totalScore = evaluatedAnswers.reduce((sum, ans) => sum + ans.score, 0);

    return res.status(200).json({
      message: 'Submission successful',
      summary: {
        totalScore,
        correctCount,
        wrongCount,
        unattemptedCount,
      },
    });
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
          questionId: ans.questionId,
          answer: ans.answer,
          score: ans.score,
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

      const totalScore = sub.answers.reduce((sum, a) => sum + a.score, 0);
      const correctCount = sub.answers.filter(a => a.score === 1).length;
      const wrongCount = sub.answers.filter(a => a.score === -1 || (a.score === 0 && a.answer !== '')).length;
      const unattemptedCount = sub.answers.filter(a => a.answer === '').length;

      return {
        ...sub._doc,
        answers: enrichedAnswers,
        duration,
        summary: {
          totalScore,
          correctCount,
          wrongCount,
          unattemptedCount,
        },
        snapshots: sub.snapshots.map(snap => ({
          image: snap.image,
          timestamp: snap.timestamp,
        })),
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

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionControllers');

// Get all questions, optionally filtered by email or other params
router.get('/getquestions', questionController.getQuestions);

// Get a single question by ID
router.get('/getquestions/:id', questionController.getQuestionById);

// Create a single question
router.post('/questions', questionController.createQuestion);

// Create multiple questions at once (bulk create)
router.post('/bulk-create', questionController.createMultipleQuestions);

// Update question by ID
router.put('/getupdate/:id', questionController.updateQuestion);

// Delete question by ID
router.delete('/delete/:id', questionController.deleteQuestion);

module.exports = router;

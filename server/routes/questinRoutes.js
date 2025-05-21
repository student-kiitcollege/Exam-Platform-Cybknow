const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionControllers');

router.get('/getquestions', questionController.getQuestions);

router.get('/getquestions/:id', questionController.getQuestionById);

router.post('/questions', questionController.createQuestion);

router.post('/bulk-create', questionController.createMultipleQuestions);

router.put('/getupdate/:id', questionController.updateQuestion);

router.delete('/delete/:id', questionController.deleteQuestion);

module.exports = router;

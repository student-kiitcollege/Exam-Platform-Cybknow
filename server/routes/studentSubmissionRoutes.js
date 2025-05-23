const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/studentSubmissionController');

router.post('/submit', submissionController.submitExam);

router.get('/submission/:studentEmail', submissionController.getSubmissionByStudent);

router.get('/getAll', submissionController.getAllSubmissions);

router.delete('/delete/:id', submissionController.deleteSubmissionById);

module.exports = router;

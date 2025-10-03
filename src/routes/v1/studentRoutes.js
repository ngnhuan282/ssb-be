const express = require('express');
const router = express.Router();
const studentController = require('../../controllers/studentController');
const studentValidation = require('../../validations/studentValidation');

router.get('/', studentController.getAllStudents);

router.get('/:id', studentController.getStudentById);

router.post('/', studentValidation.validateCreateStudent, studentController.createStudent);

router.put('/:id', studentValidation.validateUpdateStudent, studentController.updateStudent);

router.delete('/:id', studentController.deleteStudent);

module.exports = router;
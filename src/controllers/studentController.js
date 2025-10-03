const HttpStatus = require('http-status');
const studentService = require('../services/studentService');
const ApiResponse = require('../utils/apiResponse');

const getAllStudents = async (req, res, next) => {
  try {
    const students = await studentService.getAllStudents();
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, students, 'Students retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, student, 'Student retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(HttpStatus.CREATED).json(new ApiResponse(HttpStatus.CREATED, student, 'Student created successfully'));
  } catch (error) {
    next(error);
  }
};


const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, student, 'Student updated successfully'));
  } catch (error) {
    next(error);
  }
};


const deleteStudent = async (req, res, next) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.status(HttpStatus.OK).json(new ApiResponse(HttpStatus.OK, null, 'Student deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
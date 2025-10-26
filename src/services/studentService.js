const Student = require('../models/StudentModel');
const HttpStatus = require('http-status');
const ApiError = require('../utils/apiError');


const getAllStudents = async () => {
  return await Student.find().populate('route').populate({ path: "parent", populate: { path: "user" } }).exec();
};

const getStudentById = async (id) => {
  const student = await Student.findById(id).populate('route').populate({ path: "parent", populate: { path: "user" } });
  if (!student) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Student not found');
  }
  return student;
};

const createStudent = async (studentData) => {
  const student = new Student(studentData);
  const saved = await student.save();
  await saved.populate('route');
  await saved.populate({ path: "parent", populate: { path: "user" } })
  return saved
};

const updateStudent = async (id, updateData) => {
  const student = await Student.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  )
  if (!student) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Student not found');
  }
  await student.populate('route');
  await student.populate({ path: "parent", populate: { path: "user" } })
  return student;
};

const deleteStudent = async (id) => {
  const student = await Student.findByIdAndDelete(id);
  if (!student) {
    throw new ApiError(HttpStatus.NOT_FOUND, 'Student not found');
  }
  return student;
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
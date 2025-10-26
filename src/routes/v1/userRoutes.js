const express = require('express');
const router = express.Router();
const userValidation = require("../../validations/userValidation");
const userController = require("../../controllers/userController");
const authMiddleware = require("../../middlewares/authMiddleware");

router.use(authMiddleware.isAuthorized);
router.use(authMiddleware.checkRole('admin'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userValidation.validateCreateUser, userController.createUser);
router.put('/:id', userValidation.validateUpdateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
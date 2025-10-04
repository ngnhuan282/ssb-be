const express = require('express');
const router = express.Router();
const parentValidation = require("../../validations/parentValidation");
const parentController = require("../../controllers/parentController");

router.get('/', parentController.getAllParents);

router.get('/:id', parentController.getParentById);

router.post('/', parentValidation.validateCreateParent, parentController.createParent);

router.put('/:id', parentValidation.validateUpdateParent, parentController.updateParent);

router.delete('/:id', parentController.deleteParent);

module.exports = router;
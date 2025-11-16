const express = require('express');
const router = express.Router();

const notificationValidation = require('../../validations/notificationValidation');
const notificationController = require('../../controllers/notificationController');

const {
  validateCreateIncident,
  validateUpdateIncident
} = require('../../validations/notificationValidation');

const upload = require('../../middlewares/upload');


// =========================
// GET LIST INCIDENTS
// =========================
router.get('/incidents', notificationController.getEmergencyNotifications);


// =========================
// CREATE INCIDENT + UPLOAD IMAGES
// =========================
router.post(
  "/incident",
  upload.single("image"),   // NHẬN FIELD image
  (req, res, next) => {
    if (req.file) {
      req.body.images = [`/uploads/${req.file.filename}`];
    }
    next();
  },
  validateCreateIncident,
  notificationController.createNotification
);



// =========================
// CRUD NOTIFICATIONS
// =========================
router.get('/', notificationController.getAllNotifications);

router.get('/:id', notificationController.getNotificationById);

router.post(
  '/',
  notificationValidation.validateCreateNotification,
  notificationController.createNotification
);

router.put(
  '/:id',
  notificationValidation.validateUpdateNotification,
  notificationController.updateNotification
);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;

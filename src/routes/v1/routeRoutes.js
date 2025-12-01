const express = require("express");
const router = express.Router();
const routeController = require("../../controllers/routeController");
const routeValidation = require("../../validations/routeValidation");

router.get("/", routeController.getAllRoutes);

router.get("/:id/stops", routeController.getRouteStops);

router.get("/:id", routeController.getRouteById);

router.post(
  "/",
  routeValidation.validateCreateRoute,
  routeController.createRoute
);

router.put(
  "/:id",
  routeValidation.validateUpdateRoute,
  routeController.updateRoute
);

router.delete("/:id", routeController.deleteRoute);

module.exports = router;

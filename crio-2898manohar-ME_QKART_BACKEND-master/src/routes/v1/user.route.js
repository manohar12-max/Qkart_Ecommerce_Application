const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const auth = require("../../middlewares/auth");
//above can be written as {getUser}= require..... instead of userController
const router = express.Router();
const validateUserSchema=validate(userValidation.getUser)


// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement a route definition for `/v1/users/:userId`
router.get("/:userId",auth,validateUserSchema,userController.getUser)

module.exports = router; 


router.put(
  "/:userId",
  auth,
  validate(userValidation.setAddress),
  userController.setAddress
);

module.exports = router;

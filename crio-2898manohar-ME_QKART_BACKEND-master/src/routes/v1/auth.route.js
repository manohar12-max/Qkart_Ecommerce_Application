const express = require("express");
const router = express.Router();
const validate = require("../../middlewares/validate");
const authValidation = require("../../validations/auth.validation");
const authController = require("../../controllers/auth.controller");



// TODO: CRIO_TASK_MODULE_AUTH - Implement "/v1/auth/register" and "/v1/auth/login" routes with request validation
router.post("/register",validate(authValidation.register),authController.register)
router.post("/login",validate(authValidation.login),authController.login)
module.exports = router;

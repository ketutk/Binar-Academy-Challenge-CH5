const { check, validationResult } = require("express-validator");
const { ValidationRegister, ValidationLogin } = require("../validations/users.validation");
const { registerUser, loginUser, authenticate } = require("../services/auth.service");

exports.registerUser = async (req, res, next) => {
  try {
    const { error: validate } = ValidationRegister(req.body);
    if (validate) {
      return res.status(400).json({
        status: 400,
        message: validate.details,
        data: null,
      });
    }
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({
        status: 400,
        message: "Please input valid email",
        data: null,
      });
    }
    const response = await registerUser(req);

    return res.status(response.status).json(response);
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    const { error: validate } = ValidationLogin(req.body);
    if (validate) {
      return res.status(400).json({
        status: 400,
        message: validate.details,
        data: null,
      });
    }
    const response = await loginUser(req);

    return res.status(response.status).json(response);
  } catch (error) {
    next(error);
  }
};
exports.authenticate = async (req, res, next) => {
  try {
    const response = await authenticate(req);

    return res.status(response.status).json(response);
  } catch (error) {
    next(error);
  }
};

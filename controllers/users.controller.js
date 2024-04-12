const { getUsers, getUserById } = require("../services/users.service");

exports.getUsers = async (req, res, next) => {
  try {
    const response = await getUsers(req);

    return res.status(response.status).json(response);
  } catch (error) {
    next(error);
  }
};
exports.getUserById = async (req, res, next) => {
  try {
    const response = await getUserById(req);

    return res.status(response.status).json(response);
  } catch (error) {
    next(error);
  }
};

const jsonwebtoken = require("jsonwebtoken");
module.exports = {
  middleware: (req, res, next) => {
    try {
      if (req.headers && req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        try {
          const decoded = jsonwebtoken.verify(token, process.env.JWT_KEY);
          req.user_data = decoded;
          next();
        } catch {
          return res.status(401).json({
            status: 401,
            message: "Authentication failed, jwt invalid.",
            data: null,
          });
        }
      } else {
        return res.status(401).json({
          status: 401,
          message: "Authentication failed, please login.",
          data: null,
        });
      }
      /* c8 ignore start */
    } catch (error) {
      // console.log(error);
      return res.status(500).json({
        status: 500,
        message: error.message,
        data: null,
      });
    }
  },
};

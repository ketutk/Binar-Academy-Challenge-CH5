require("dotenv").config();
const express = require("express");
const cors = require("cors");
const yaml = require("yaml");
const swaggerUI = require("swagger-ui-express");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routing
const mainRoute = "/api/v1";
const userRouter = require("./routes/users.route");
const authRouter = require("./routes/auth.route");
const accountRouter = require("./routes/accounts.route");
const transactionRouter = require("./routes/transactions.route");

// Swagger
const file = fs.readFileSync("./api-docs.yaml", "utf-8");
const swaggerDocument = yaml.parse(file);
app.use(`${mainRoute}/api-docs`, swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use(`${mainRoute}/users`, userRouter);
app.use(`${mainRoute}/auth`, authRouter);
app.use(`${mainRoute}/accounts`, accountRouter);
app.use(`${mainRoute}/transactions`, transactionRouter);

// ERROR HANDLING MIDDLEWARE FOR INTERNAL SERVER ERROR
app.use((err, req, res, next) => {
  return res.status(500).json({
    status: 500,
    message: err.message,
    data: null,
  });
});
/* c8 ignore start */
// ERROR HANDLING MIDDLEWARE FOR SERVER NOT FOUND
app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    error: `Server not found. There is no endpoint on ${req.url}`,
    data: null,
  });
});

module.exports = app;

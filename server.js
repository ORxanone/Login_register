require("dotenv").config();
const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const connect = require("./Utils/db");
const userRouter = require("./routers/user");
const verifyToken = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view enjine", "ejs");

const PORT = process.env.PORT || 8080;


// swagger
const swaggerOption = {
  swaggerDefinition: {
    info: {
      title: "http://localhost:8080/registration",
      version: "1.0.0",
      description: "http://localhost:8080/registration",
    },
  },
  apis: ["./user.js"],
};
const swaggerDocs = require("./swagger.json");

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/", require("./routers/user.js"));
// swagger

app.set("view engine", "ejs");

app.use("/", userRouter);

connect();
app.listen(PORT, () => {
  console.log("Node connected");
});

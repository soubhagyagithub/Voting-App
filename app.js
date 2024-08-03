const express = require("express");
const app = express();

const dotenv = require("dotenv");
dotenv.config();
const database = require("./util/database");

const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const userRouter = require("./routes/userRoutes");
const candidateRouter = require("./routes/candidateRoutes");

app.use("/user", userRouter);
app.use("/candidate", candidateRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is started on port${port}`);
});

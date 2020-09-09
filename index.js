const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));

app.listen(process.env.PORT || 5000);

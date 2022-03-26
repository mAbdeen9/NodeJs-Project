const express = require("express");

const app = express();
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSantitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const AppError = require("./utility/appError");
const loginRouter = require("./Routes/loginRouter");
const UserRouter = require("./Routes/userRouter");
const registerRouter = require("./Routes/registerRouter");
const cardRouter = require("./Routes/cardRouter");
const errorHandlerCtrl = require("./controller/errorController");
//limit req from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests From this IP, try again later",
});
app.use(cors());
//-Middlewares
app.use(cookieParser());
app.use(helmet()); // set security HTTP headers
app.use("/api", limiter);
app.use(morgan("dev"));
app.use(express.json({ limit: "10kb" })); // body parser, reading data from body into req.body
app.use(mongoSantitize()); //data santization against nosql query injection
app.use(xss()); //data santization
//-Routes
app.use("/api/v1/login", loginRouter);
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/register", registerRouter);
app.use("/api/v1/card", cardRouter);

//Handle all not handled urls
app.all("*", (req, res, next) => {
  next(new AppError(`Can't Find ${req.originalUrl} on this server 😟 `, 404));
});
//Express Built in Error Handler Middleware
app.use(errorHandlerCtrl);
//-Exports
module.exports = app;

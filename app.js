const express = require("express");
const mongoSanitizer = require("express-mongo-sanitize");
const dotenv = require("dotenv");
const morgan = require("morgan");
const fileURLToPath = require("url").fileURLToPath;
const dirname = require("path").dirname;
const hpp = require('hpp');
const handlebars = require("express-handlebars");

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// Routers
const adminRouter = require("./routes/adminRoutes");
const eventRouter = require("./routes/eventRoutes");
const gymRouter = require("./routes/gymRoutes");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const trainerRouter = require("./routes/trainerRoutes");
// Express app
const app = express();

// Middlewares
app.use(express.json());
dotenv.config({ path: "./.env" });
app.use(morgan("dev"));

//For avoiding parameter pollution
app.use(hpp());
// Middleware for preventing NoSQL query injection
app.use(mongoSanitizer());

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  // If the user posts to the server with a property called _method, rewrite the request's method
  // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
  // rewritten in this middleware to a PUT route
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  // let the next middleware run:
  next();
};

const staticDir = express.static(__dirname + "/public");
app.use("/public", staticDir);
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/gym", gymRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/trainer", trainerRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;

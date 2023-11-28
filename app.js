import express from "express";
import { engine as handlebarsEngine } from "express-handlebars";
import mongoSanitizer from "express-mongo-sanitize";
import dotenv from "dotenv";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";

import adminRouter from "./routes/adminRoutes.js";
import eventRouter from "./routes/eventRoutes.js";
import gymRouter from "./routes/gymRoutes.js";
import postRouter from "./routes/postRoutes.js";
import userRouter from "./routes/userRoutes.js";
import trainerRouter from "./routes/trainerRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routers
const adminRouter = require("./routes/adminRoutes");
const eventRouter = require("./routes/eventRoutes");
const gymRouter = require("./routes/gymRoutes");
const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");
// Express app
const app = express();

// Middlewares
app.use(express.json());
dotenv.config({ path: "./.env" });
app.use(morgan("dev"));
// Middleware for preventing NoSQL query injection
app.use(mongoSanitizer());

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};

const staticDir = express.static(__dirname + "/public");
app.use("/public", staticDir);
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.engine("handlebars", handlebarsEngine({ defaultLayout: "main" }));
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

export default app;

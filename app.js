const express = require("express");
const mongoSanitizer = require("express-mongo-sanitize");

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

// Middleware for preventing NoSQL query injection
app.use(mongoSanitizer());

// Routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/gym", gymRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/trainer", trainerRouter);

app.all("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

module.exports = app;

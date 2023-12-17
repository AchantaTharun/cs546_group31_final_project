import express from "express";
import { engine as handlebarsEngine } from "express-handlebars";
import mongoSanitizer from "express-mongo-sanitize";
import dotenv from "dotenv";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cookieParser from "cookie-parser";
import configRoutesFunction from "./routes/index.js";
import hpp from "hpp";
import { generateUploadURL } from "./utils/s3.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express app
const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
dotenv.config({ path: "./.env" });
app.use(morgan("dev"));
app.use(cookieParser());

//For avoiding parameter pollution
app.use(hpp());
// Middleware for preventing NoSQL query injection
app.use(mongoSanitizer());

//The first middleware, so that the file uploads doesn't runs into conflicts with the other routes.
// app.get('/admin/s3Url',async (req,res)=>{
//   //console.log("Gonna get the URL for the file upload rn");
//   const url = await generateUploadURL();
//   res.send({url})
// })

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
app.engine(
  "handlebars",
  handlebarsEngine({
    defaultLayout: "main",
    helpers: {
      getSlotId: function (obj, key, index) {
        return obj[key][index].id;
      },
      getSlotName: function (obj, key, index) {
        return obj[key][index].name;
      },
      getSlotPlace: function (obj, key, index) {
        return obj[key][index].place;
      },
      getSlotAttendees: function (obj, key, index) {
        return obj[key][index].attendees;
      },
      getSlotColor: function (day) {
        day = day.toUpperCase();
        if (day === "SUNDAY") {
          return "bg-orange padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom text-white font-size16  xs-font-size13";
        } else if (day === "MONDAY") {
          return "bg-orange padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom text-white font-size16  xs-font-size13";
        } else if (day === "TUESDAY") {
          return "bg-green padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom text-white font-size16  xs-font-size13";
        } else if (day === "WEDNESDAY") {
          return "bg-pink padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom text-white font-size16  xs-font-size13";
        } else if (day === "THURSDAY") {
          return "bg-black padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom text-white font-size16  xs-font-size13";
        } else if (day === "FRIDAY") {
          return "bg-gray padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom text-white font-size16  xs-font-size13";
        } else if (day === "SATURDAY") {
          return "bg-orange padding-5px-tb padding-15px-lr border-radius-5 margin-10px-bottom text-white font-size16  xs-font-size13";
        }
      },
      ifEquals: function (arg1, arg2) {
        return arg1 === arg2 ? true : false;
      },
      ifNotEquals: function (arg1, arg2) {
        return arg1 !== arg2 ? true : false;
      },
      eq: function (arg1, arg2, options) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      },
    },
  })
);
app.set("view engine", "handlebars");

app.use((req, res, next) => {
  if (req.url.startsWith("/user") || req.url.startsWith("/trainer")) {
    if (!req.url.startsWith("/trainer/signup")) res.locals.layout = "dashboard";
  } else {
    if (req.url.startsWith("/api/v1/admin")) {
      res.locals.layout = "adminMain";
    } else {
      res.locals.layout = "main";
    }
  }
  next();
});
configRoutesFunction(app);
export default app;

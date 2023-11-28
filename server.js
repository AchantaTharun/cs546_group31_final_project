import mongoose from "mongoose";
import app from "./app.js";

(async () => {
  try {
    const connection = await mongoose.connect(
      "mongodb://127.0.0.1:27017/GymMate",
      {
        useNewUrlParser: true,
      }
    );
    if (connection) {
      console.log("Connected to DB");
    }
  } catch (e) {
    console.log(e);
  }
})();
app.listen(3000, () => console.log("Server started at port : 3000"));

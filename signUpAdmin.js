import * as adminController from "../controllers/adminController.js";
import mongoose from "mongoose";
////This will be considered as a test bed.
try {
  adminController.makeAdmin({
    firstName: "Akshit",
    lastName: "Walia",
    email: "waliaakshit1970@gmail.com",
    contactNumber: "5168067777",
    password: "Helltrap@9",
    passwordConfirm: "Helltrap@9",
    isAdmin: true,
  });
} catch (err) {
  console.log(err);
}




////////////////////
// (async () => {
//   try {
//     const connection = await mongoose.connect(
//       "mongodb://127.0.0.1:27017/GymMate",
//       {
//         useNewUrlParser: true,
//       }
//     );
//     if (connection) {
//       console.log("Connected to DB");
//     }
//   } catch (e) {
//     console.log(e);
//   }
// })();
////Could be used later for testing
// try
// {
//   let object = await adminController.deleteOne('user','657519dc0249e28be8a22d59');
//   console.log(object);
// }
// catch(e)
// {
//   console.log(e);
// }


////Useful in the future for image testing
// try
// {
//   let changedAdmin = await adminController.createEvent("657184dda2f6c5abb2c95fef",
//   "Godfather 3 is the best movie",
//   "Not lying",
//   "wAliaakshit1972@gmail.com",
//   "99 Grace Street",
//   "Jersey City",
//   "nj",
//   "07307",
//   23,
//   12.345,
//   "2023-12-12T01:52",
//   "2023-12-12T10:26",
//   "2023-12-12T10:44",
//   0);
//   console.log("Event was created successfully");
// }
// catch(e)
// {
//   console.log(e);
// }

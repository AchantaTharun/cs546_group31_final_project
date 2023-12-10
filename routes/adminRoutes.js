import * as authController from "../controllers/authController.js";
import * as adminController from "../controllers/adminController.js";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import { Router } from "express";
import * as e_valid from 'email-validator'
import * as help from "../Helpers.js";

const router = Router();

//This is for file catching
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// // Route to handle file upload
// app.post('/upload', upload.single('image'), async (req, res) => {
//   try {
//     const { originalname, buffer } = req.file;
    
//     // Create a new image instance
//     const newImage = new Image({
//       imageName: originalname,
//       imageData: buffer,
//     });
    
//     // Save the image to the database
//     await newImage.save();

//     // Now, you can store the newImage._id in another model
//     const otherModelInstance = new OtherModel({
//       // Other fields in your model
//       // ...
//       image: newImage._id,
//     });

//     await otherModelInstance.save();

//     res.send('Image uploaded and data stored successfully!');
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

//SENDING IMAGE DATA THROUGH HANDLEBARS
// app.get('/displayImage/:id', async (req, res) => {
//   try {
//     const imageId = req.params.id;
    
//     // Fetch the image data from the database using the image ID
//     const image = await Image.findById(imageId);

//     // Render the Handlebars template passing the image data
//     res.render('imagePage', { imageData: image.imageData.toString('base64') });
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });


const signJWT = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
};

const checkTokenValid = (passwordChangedAt, tokenIssuedAt) => {
  if (passwordChangedAt) {
    const passwordChangedAtTimestamp = parseInt(
      passwordChangedAt.getTime() / 1000,
      10
    );
    return passwordChangedAtTimestamp > tokenIssuedAt;
  }
  return false;
};

let restrict = (req,res,next) =>{
  //First we need to check for a token.
  let token;
  try{
  // const authHeader = req.headers.authorization;
  // if (authHeader && authHeader.startsWith("Bearer")) {
  //   token = authHeader.split(" ")[1];
  // }
  if(!req.cookies.adminjwt)
  {
    console.log("12");
    res.redirect("api/v1/admin/admin-login");
  }
  token = req.cookies.adminjwt;
  // if (!token) {
  //   console.log("13");
  //   return res.redirect('/api/v1/admin/admin-login');   //check for the status message
  // }
} catch(e)
{
  //console.log("14");
  return res.status(401).render('admin-login',{title:"ADMIN LOGIN",error:`Some Kind of a Cookie Error | ${e}`});
}
  jwt.verify(token, process.env.JWT_SECRET,async (err,data)=>{
    if(err) 
    {
      return res.status(401).render('admin-login',{title:"ADMIN LOGIN",error:"Token Verification Failed"});
    }
    try{
    if (data.role!=='admin')
    {
      return res.status(401).render('admin-login',{title:"ADMIN LOGIN",error:"Tampered Token Case"});
    }
    //Now check if the admin is there in the database
    const admin = await Admin.findById(data.id);
    if (!admin) {
      //console.log("15");
      return res.status(404).render('admin-login',{title:"ADMIN LOGIN",error:"No Such Admin user was in the database"});
    }
    if (
      "passwordChangedAt" in admin &&
      checkTokenValid(admin.passwordChangedAt, data.iat)
    ) {
      //console.log("16");
      return res.status(404).render('admin-login',{title:"ADMIN LOGIN",error:"Password was changed recently"});
    }
    req.admin = admin;
    if(req.path==='/api/v1/admin/admin-login')
    {
      //console.log("17");
      return res.redirect('/api/v1/admin/admin-homepage');
    } 
  } catch(e)
  {
    //console.log("18");
    return res.status(400).render('admin-login',{title:"ADMIN LOGIN",error:e});
  }
    next();
  });

}


router
  .route("/admin-login")
  .get(async(req,res) =>{ 
    res.status(200).render('admin-login',{title:"ADMIN LOGIN",error:""});
  })
  .post(async(req,res) =>{ 
    //Get the credentials from req.body
    let {emailAddressInput,passwordInput} = req.body;
    
    //validation part
    if(!emailAddressInput || !passwordInput)
    {
      return res.status(400).render('admin-login',{title:"LOGIN PAGE",error:"Either the email address or password was not provided"});
    }

    try
    {
      if(typeof emailAddressInput!=='string') throw "Email Address Input is not of valid datatype";
      emailAddressInput = emailAddressInput.trim().toLowerCase();
      if(!e_valid.validate(emailAddressInput)) throw "Email Address is not valid";
    } catch(e)
    {
      return res.status(400).render('admin-login',{title:"LOGIN PAGE",error:"Either the email address or password is invalid"});
    }

    try{
    passwordInput = help.checkPassword(passwordInput);
    }catch(e)
    {
      return res.status(400).render('admin-login',{title:"LOGIN PAGE",error:e});
    }

    //Getting the actual data and assigning the session data
    let admin_;
    try
    {
      admin_ = await adminController.adminLogin(emailAddressInput,passwordInput); //This is where the main controller  function will be used.
      
    } catch(e)
    {
      return res.status(400).render('admin-login',{title:"LOGIN PAGE",error:e});
    }
    if(admin_)
    {
      const token = signJWT(admin_._id, "admin");
      // res.status(200).json({token});
      res.cookie("adminjwt", token, {
        httpOnly: true,
        secure: false, 
        sameSite: "Strict",
      })
      res.redirect("/api/v1/admin/admin-homepage");
    }
    else
    {
      return res.status(400).render('admin-login',{title:"LOGIN PAGE",error:"Either the email address or password is invalid"});
    }
  })

  router.
  route("/admin-homepage")
  .get(restrict,async(req,res) =>{ 
    return res.status(200).render('admin-homepage',{title:"ADMIN HOMEPAGE",error:req.admin._id});
  })
  .post(restrict,async(req,res) =>{ 
  })

  router.
  route("/admin-commentpage")
  .get(restrict,async(req,res) =>{ 
    return res.status(200).render('admin-commentpage',{title:"ADMIN PROFANITY FILTER",error:req.admin._id});
  })
  .post(restrict,async(req,res) =>{ 
  })

  router.
  route("/admin-usertrainerpage")
  .get(restrict,async(req,res) =>{ 
    return res.status(200).render('admin-usertrainerpage',{title:"USER / TRAINER / GYMS",error:req.admin._id});
  })
  .post(restrict,async(req,res) =>{ 
  })

// router.patch(
//   "/approve-gym/:gymId",
//   authController.restrictTo("admin"),
//   authController.protectRoute,
//   adminController.approveGym
// );
// router.patch(
//   "/reject-gym/:gymId",
//   authController.restrictTo("admin"),
//   authController.protectRoute,
//   adminController.rejectGym
// );

// router.patch(
//   "/approve-trainer/:trainerId",
//   authController.restrictTo("admin"),
//   authController.protectRoute,
//   adminController.approveTrainer
// );

// router.patch(
//   "/reject-trainer/:trainerId",
//   authController.restrictTo("admin"),
//   adminController.rejectTrainer
// );

// router.get(
//   "/gymRequests",
//   authController.restrictTo("admin"),
//   authController.protectRoute,
//   adminController.getAllGymsRequests
// );

// router.get(
//   "/trainerRequests",
//   authController.restrictTo("admin"),
//   authController.protectRoute,
//   adminController.getAllTrainersRequests
// );

// router.get(
//   "/rejectedGyms",
//   authController.restrictTo("admin"),
//   authController.protectRoute,
//   adminController.getAllRejectedRequestsGyms
// );

// router.get(
//   "/rejectedTrainers",
//   authController.restrictTo("admin"),
//   authController.protectRoute,
//   adminController.getAllRejectedRequestsTrainers
// );

export default router;

import * as authController from "../controllers/authController.js";
import * as adminController from "../controllers/adminController.js";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import { Router } from "express";
import * as e_valid from 'email-validator'
import * as help from "../Helpers.js";

const router = Router();
//ADD IT HERE

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
}; //

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
    res.redirect("api/v1/admin/login");
  }
  token = req.cookies.adminjwt;
  // if (!token) {
  //   console.log("13");
  //   return res.redirect('/api/v1/admin/admin-login');   //check for the status message
  // }
} catch(e)
{
  console.log("14");
  return res.status(401).render('admin/login',{title:"ADMIN LOGIN",error:`Some Kind of a Cookie Error | ${e}`});
}
  jwt.verify(token, process.env.JWT_SECRET,async (err,data)=>{
    if(err) 
    {
      return res.status(401).render('admin/login',{title:"ADMIN LOGIN",error:"Token Verification Failed"});
    }
    try{
    if (data.role!=='admin')
    {
      return res.status(401).render('admin/login',{title:"ADMIN LOGIN",error:"Tampered Token Case"});
    }
    //Now check if the admin is there in the database
    const admin = await Admin.findById(data.id);
    if (!admin) {
      console.log("15");
      return res.status(404).render('admin/login',{title:"ADMIN LOGIN",error:"No Such Admin user was in the database"});
    }
    if (
      "passwordChangedAt" in admin &&
      checkTokenValid(admin.passwordChangedAt, data.iat)
    ) {
      console.log("16");
      return res.status(404).render('admin/login',{title:"ADMIN LOGIN",error:"Password was changed recently"});
    }
    req.admin = admin;
    if(req.path==='/api/v1/admin/login')
    {
      console.log("17");
      return res.redirect('/api/v1/admin/homepage');
    } 
  } catch(e)
  {
    console.log("18");
    return res.status(400).render('admin/login',{title:"ADMIN LOGIN",error:e});
  }
    next();
  });

}


router
  .route("/login")
  .get(async(req,res) =>{ 
    console.log("Make")
    res.status(200).render('admin/login',{title:"ADMIN LOGIN",error:""});
  })
  .post(async(req,res) =>{ 
    //Get the credentials from req.body
    let {emailAddressInput,passwordInput} = req.body;
    
    //validation part
    if(!emailAddressInput || !passwordInput)
    {
      return res.status(400).render('admin/login',{title:"LOGIN PAGE",error:"Either the email address or password was not provided"});
    }

    try
    {
      if(typeof emailAddressInput!=='string') throw "Email Address Input is not of valid datatype";
      emailAddressInput = emailAddressInput.trim().toLowerCase();
      if(!e_valid.validate(emailAddressInput)) throw "Email Address is not valid";
    } catch(e)
    {
      return res.status(400).render('admin/login',{title:"LOGIN PAGE",error:"Either the email address or password is invalid"});
    }

    try{
    passwordInput = help.checkPassword(passwordInput);
    }catch(e)
    {
      return res.status(400).render('admin/login',{title:"LOGIN PAGE",error:e});
    }

    //Getting the actual data and assigning the session data
    let admin_;
    try
    {
      admin_ = await adminController.adminLogin(emailAddressInput,passwordInput); //This is where the main controller  function will be used.
      
    } catch(e)
    {
      return res.status(400).render('admin/login',{title:"LOGIN PAGE",error:e});
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
      res.redirect("/api/v1/admin/homepage");
    }
    else
    {
      return res.status(400).render('admin/login',{title:"LOGIN PAGE",error:"Either the email address or password is invalid"});
    }
  })

  router.
  route("/homepage")
  .get(restrict,async(req,res) =>{ 
    const data = await adminController.getAllSignUpRequests();
    const modifiedData = data.map(item => {
      return Object.assign({}, item, { requestType: item.requestType,requestedBy: item.requestedBy });
    });
    return res.status(200).render('admin/homepage',{title:"HOMEPAGE",error:"",data:modifiedData});
  })

  router.
  route("/signupRequests/gym/:id")   //ID defect.
  .get(restrict,async(req,res) =>{ 
    try{
      req.params.id = help.checkId(req.params.id);
      } catch(e) {
        return res.status(400).render('admin/gymRequest',{title:"GYM REQUEST",hasData:false,error: e});
    }
    //Validations are complete.
    let object =undefined;
    try
    {
      object = await adminController.getOne('gym',req.params.id);
    } catch(e)
    {
      return res.status(404).render('admin/gymRequest',{title:"GYM REQUEST",hasData:false,error:e});
    }
    if(!object)   
    {
      return res.status(500).render('admin/gymRequest',{title:"GYM REQUEST",hasData:false,error:"Internal Server Error"});
    }

    return res.status(200).render('admin/gymRequest',{title:"GYM REQUEST",hasData:true,error:"",
    gymName:object.gymName,
    email:object.email,
    phone:object.phone,
    street:object.address.street,
    state:object.address.state,
    city:object.address.city,
    zip:object.address.zip,
    objectId:object._id.toString()});
  })
  .post(restrict,async(req,res) =>{
    let {status,reason} = req.body;
    let id = help.checkId(req.params.id);
    let type = "gym";
    try{
      //General validations
      if(!status || !id || !type || !reason) throw "Some Fields are missing";
      reason = help.checkString(reason);
      status = help.checkString(status);
      type = help.checkString(type);
      id = help.checkId(id);

      //Case Specific validations
      if(status !=="approved" && status !=="rejected") throw "Status has to be either Accepted or Rejected";
      if(type!=="gym") throw "Type has to be a gym in this very case scenario";
    } catch(e)
    {
      return res.status(400).render('admin/gymRequest',{title:"GYM REQUEST",hasData:false,error:e});
    }
    try{
      adminController.statusChange(status,id,type,reason);
    }catch(e)
    {
      return res.status(404).render('admin/gymRequest',{title:"GYM REQUEST",hasData:false,error:e});
    }
    return res.redirect('/api/v1/admin/homepage');
  })

  router.
  route("/signupRequests/trainer/:id") 
  .get(restrict,async(req,res) =>{ 
    try{
      req.params.id = help.checkId(req.params.id);
      } catch(e) {
        return res.status(400).render('admin/trainerRequest',{title:"TRAINER REQUEST",hasData:false,error: e});
    }
    //Validations are complete.
    let object =undefined;
    try
    {
      object = await adminController.getOne('trainer',req.params.id);
    } catch(e)
    {
      return res.status(404).render('admin/trainerRequest',{title:"TRAINER REQUEST",hasData:false,error:e});
    }
    if(!object)   
    {
      return res.status(500).render('admin/trainerRequest',{title:"TRAINER REQUEST",hasData:false,error:"Internal Server Error"});
    }

    return res.status(200).render('admin/trainerRequest',{title:"TRAINER REQUEST",hasData:true,error:"",
    trainerName:object.trainerName,
    email:object.email,
    phone:object.phone,
    street:object.address.street,
    state:object.address.state,
    city:object.address.city,
    zip:object.address.zip,
    objectId:object._id.toString()});
  })
  .post(restrict,async(req,res) =>{
    let {status,reason} = req.body;
    let id = help.checkId(req.params.id);
    let type = "trainer";
    try{
      //General validations
      if(!status || !id || !type || !reason) throw "Some Fields are missing";
      reason = help.checkString(reason);
      status = help.checkString(status);
      type = help.checkString(type);
      id = help.checkId(id);

      //Case Specific validations
      if(status !=="approved" && status !=="rejected") throw "Status has to be either Accepted or Rejected";
      if(type!=="trainer") throw "Type has to be a gym in this very case scenario";
    } catch(e)
    {
      return res.status(400).render('admin/trainerRequest',{title:"TRAINER REQUEST",hasData:false,error:e});
    }
    try{
      adminController.statusChange(status,id,type,reason);
    }catch(e)
    {
      return res.status(404).render('admin/trainerRequest',{title:"TRAINER REQUEST",hasData:false,error:e});
    }
    return res.redirect('/api/v1/admin/homepage');
  })

  router.
  route("/rejectedRequests")
  .get(restrict,async(req,res) =>{
    const data = await adminController.getAllRequestReports();
    const modifiedData = data.map(item => {
      return Object.assign({}, item, { requestType: item.requestType,email: item.email, reason:item.reason, id:item._id});
    });
    return res.status(200).render('admin/rejected',{title:"REJECTED REQUESTS PAGE",error:"",data:modifiedData});
  })

  router.
  route("/rejectedRequests/:id")
  .get(restrict,async(req,res) => {
    try{
      req.params.id = help.checkId(req.params.id);
      } catch(e) {
        return res.status(400).render('admin/rejectedpage',{title:"REJECTED REQUEST",hasData:false,error: e});
    }
    //Validations are complete.
    let object =undefined;
    try
    {
      object = await adminController.getOneRequestReport(req.params.id);
    } catch(e)
    {
      return res.status(404).render('admin/rejectedpage',{title:"REJECTED REQUEST",hasData:false,error:e});
    }
    if(!object)   
    {
      return res.status(500).render('admin/rejectedpage',{title:"REJECTED REQUEST",hasData:false,error:"Internal Server Error"});
    }

    return res.status(200).render('admin/rejectedpage',{title:"REJECTED REQUEST",hasData:true,error:"",
    requestType:object.requestType,
    email:object.email,
    phone:object.phone,
    street:object.address.street,
    state:object.address.state,
    city:object.address.city,
    zip:object.address.zip,
    objectId:object._id.toString(),
    reason: object.reason
  });
  })

  router.
  route("/manage")
  .get(restrict,async(req,res)=>{
    //We have to display the 
    return res.status(200).render('admin/manage',{title:"MANAGE DATA",hasData:false,error:""});
  })
  .post(restrict,async(req,res)=>{
    let {type,name} = req.body;
    let data = undefined;
    try{
      if(!type) throw "The type parameter is missing";
      if(typeof type!=='string') throw "Collection type must be in string format";
      type=type.trim();
      if(type!=='user' && type!=='trainer' && type!=='gym' && type!=='event' && type!=='post') throw "Invalid Collection type was passed";
      if(name)
      {
        if(typeof name!=='string') throw "Name/Title if provided, must be of string type";
        name = help.checkString(name);
      }
    } catch(e)
    {
      return res.status(400).render('admin/manage',{title:"MANAGE DATA",hasData:false,error:e});
    }

    //Validation Part is Completed
    try
    {
      if(!name)
      {
        data = await adminController.getAll(type);
      }
      else
      {
        data = await adminController.getSome(type,name);
      }
    } catch(e)
    {
      return res.status(400).render('admin/manage',{title:"MANAGE DATA",hasData:false,error:e});
    }
    let modifiedData = [];
    if(data.length===0)
    {
      return res.status(404).render('admin/manage',{title:"MANAGE DATA",hasData:false,error:"No entries, based on filters can be found in the database"});
    }
    else{
      
      if(type==="gym") modifiedData = data.map(item => { return Object.assign({}, item, { Type: type, ID: item._id, Name:item.gymName })});
      if(type==="trainer") modifiedData = data.map(item => { return Object.assign({}, item, { Type: type, ID: item._id, Name:item.trainerName })});
      if(type==="user") modifiedData = data.map(item => { return Object.assign({}, item, { Type: type, ID: item._id, Name:(item.firstName + item.lastName) })});
      if(type==="event") modifiedData = data.map(item => { return Object.assign({}, item, { Type: type, ID: item._id, Name:item.title })});
      if(type==="post") modifiedData = data.map(item => { return Object.assign({}, item, { Type: type, ID: item._id, Name:item.title })});
  }
    return res.status(200).render('admin/manage',{title:"MANAGE DATA",error:"",hasData:true,data:modifiedData});
  })

  router.
  route("/manage/gym/:id")
  .get(restrict,async(req,res)=>{
    try{
      req.params.id = help.checkId(req.params.id);
      } catch(e) {
        return res.status(400).render('admin/gymEntity',{title:"GYM DATA",hasData:false,error: e});
    }
    //Validations are complete.
    let object =undefined;
    try
    {
      object = await adminController.getOne('gym',req.params.id);
    } catch(e)
    {
      return res.status(404).render('admin/gymEntity',{title:"GYM DATA",hasData:false,error:e});
    }
    if(!object)   
    {
      return res.status(500).render('admin/gymEntity',{title:"GYM DATA",hasData:false,error:"Internal Server Error"});
    }

    return res.status(200).render('admin/gymEntity',{title:"GYM DATA",hasData:true,error:"",
    gymName:object.gymName,
    email:object.email,
    phone:object.phone,
    street:object.address.street,
    state:object.address.state,
    city:object.address.city,
    zip:object.address.zip,
    objectId:object._id.toString()});
  })
  .post(restrict,async(req,res)=>{
    let id = req.params.id;
    let type = "gym";
    let object = undefined;
    try{
      //General validations
      if(!id || !type ) throw "Some Fields are missing";
      type = help.checkString(type);
      id = help.checkId(id);

      //Case Specific validations
      if(type!=="gym") throw "Type has to be a gym in this very case scenario";
    } catch(e)
    {
      return res.status(400).render('admin/gymEntity',{title:"GYM DATA",hasData:false,error:e});
    }
    try{
      object = await adminController.deleteOne(type,id);
    }catch(e)
    {
      return res.status(404).render('admin/gymEntity',{title:"GYM DATA",hasData:false,error:e});
    }
    // console.log("\nDeleted Object is:",object);
    return res.redirect('/api/v1/admin/manage');
  })

  router.
  route("/manage/trainer/:id")
  .get(restrict,async(req,res)=>{
    try{
      req.params.id = help.checkId(req.params.id);
      } catch(e) {
        return res.status(400).render('admin/trainerEntity',{title:"TRAINER DATA",hasData:false,error: e});
    }
    //Validations are complete.
    let object =undefined;
    try
    {
      object = await adminController.getOne('trainer',req.params.id);
    } catch(e)
    {
      return res.status(404).render('admin/trainerEntity',{title:"TRAINER DATA",hasData:false,error:e});
    }
    if(!object)   
    {
      return res.status(500).render('admin/trainerEntity',{title:"TRAINER DATA",hasData:false,error:"Internal Server Error"});
    }

    return res.status(200).render('admin/trainerEntity',{title:"TRAINER DATA",hasData:true,error:"",
    trainerName:object.trainerName,
    email:object.email,
    phone:object.phone,
    street:object.address.street,
    state:object.address.state,
    city:object.address.city,
    zip:object.address.zip,
    objectId:object._id.toString()});
  })
  .post(restrict,async(req,res)=>{
    let id = req.params.id;
    let type = "trainer";
    let object = undefined;
    try{
      //General validations
      if(!id || !type ) throw "Some Fields are missing";
      type = help.checkString(type);
      id = help.checkId(id);

      //Case Specific validations
      if(type!=="trainer") throw "Type has to be a trainer in this very case scenario";
    } catch(e)
    {
      return res.status(400).render('admin/trainerEntity',{title:"TRAINER DATA",hasData:false,error:e});
    }
    try{
      object = await adminController.deleteOne(type,id);
    }catch(e)
    {
      return res.status(404).render('admin/trainerEntity',{title:"TRAINER DATA",hasData:false,error:e});
    }
    // console.log("\nDeleted Object is:",object);
    return res.redirect('/api/v1/admin/manage');
  })

  router.
  route("/manage/user/:id")
  .get(restrict,async(req,res)=>{
    try{
      req.params.id = help.checkId(req.params.id);
      } catch(e) {
        return res.status(400).render('admin/userEntity',{title:"USER DATA",hasData:false,error: e});
    }
    //Validations are complete.
    let object =undefined;
    try
    {
      object = await adminController.getOne('user',req.params.id);
    } catch(e)
    {
      return res.status(404).render('admin/userEntity',{title:"USER DATA",hasData:false,error:e});
    }
    if(!object)   
    {
      return res.status(500).render('admin/userEntity',{title:"USER DATA",hasData:false,error:"Internal Server Error"});
    }

    return res.status(200).render('admin/userEntity',{title:"USER DATA",hasData:true,error:"",
    name:(object.firstName + object.lastName),
    email:object.email,
    objectId:object._id.toString()});
  })
  .post(restrict,async(req,res)=>{
    let id = req.params.id;
    let type = "user";
    let object = undefined;
    try{
      //General validations
      if(!id || !type ) throw "Some Fields are missing";
      type = help.checkString(type);
      id = help.checkId(id);

      //Case Specific validations
      if(type!=="user") throw "Type has to be a user in this very case scenario";
    } catch(e)
    {
      return res.status(400).render('admin/userEntity',{title:"USER DATA",hasData:false,error:e});
    }
    try{
      object = await adminController.deleteOne(type,id);
    }catch(e)
    {
      return res.status(404).render('admin/userEntity',{title:"USER DATA",hasData:false,error:e});
    }
    // console.log("\nDeleted Object is:",object);
    return res.redirect('/api/v1/admin/manage');
  })

  router.
  route("/manage/event/:id")
  .get(restrict,async(req,res)=>{
    try{
      req.params.id = help.checkId(req.params.id);
      } catch(e) {
        return res.status(400).render('admin/eventEntity',{title:"EVENT DATA",hasData:false,error: e});
    }
    //Validations are complete.
    let object =undefined;
    try
    {
      object = await adminController.getOne('event',req.params.id);
    } catch(e)
    {
      return res.status(404).render('admin/eventEntity',{title:"EVENT DATA",hasData:false,error:e});
    }
    if(!object)   
    {
      return res.status(500).render('admin/eventEntity',{title:"EVENT DATA",hasData:false,error:"Internal Server Error"});
    }

    return res.status(200).render('admin/eventEntity',{title:"EVENT DATA",hasData:true,error:"",
    title:object.title,
    contactEmail:object.contactEmail,
    street:object.eventLocation.streetAddress,
    state:object.eventLocation.state,
    city:object.eventLocation.city,
    zip:object.eventLocation.zipCode,
    objectId:object._id.toString()});
  })
  .post(restrict,async(req,res)=>{
    let id = req.params.id;
    let type = "event";
    let object = undefined;
    try{
      //General validations
      if(!id || !type ) throw "Some Fields are missing";
      type = help.checkString(type);
      id = help.checkId(id);

      //Case Specific validations
      if(type!=="event") throw "Type has to be an event in this very case scenario";
    } catch(e)
    {
      return res.status(400).render('admin/eventEntity',{title:"EVENT DATA",hasData:false,error:e});
    }
    try{
      object = await adminController.deleteOne(type,id);
    }catch(e)
    {
      return res.status(404).render('admin/eventEntity',{title:"EVENT DATA",hasData:false,error:e});
    }
    //console.log("\nDeleted Object is:",object);
    return res.redirect('/api/v1/admin/manage');
  })
  
  router.
  route("/manage/post/:id")
  .get(restrict,async(req,res)=>{
    try{
      req.params.id = help.checkId(req.params.id);
      } catch(e) {
        return res.status(400).render('admin/postEntity',{title:"POST DATA",hasData:false,error: e});
    }
    //Validations are complete.
    let object =undefined;
    try
    {
      object = await adminController.getOne('post',req.params.id);
    } catch(e)
    {
      return res.status(404).render('admin/postEntity',{title:"POST DATA",hasData:false,error:e});
    }
    if(!object)   
    {
      return res.status(500).render('admin/postEntity',{title:"POST DATA",hasData:false,error:"Internal Server Error"});
    }

    return res.status(200).render('admin/postEntity',{title:"POST DATA",hasData:true,error:"",
    title:object.title,
    description:object.description,
    objectId:object._id.toString()});
  })
  .post(restrict,async(req,res)=>{
    let id = req.params.id;
    let type = "post";
    let object = undefined;
    try{
      //General validations
      if(!id || !type ) throw "Some Fields are missing";
      type = help.checkString(type);
      id = help.checkId(id);

      //Case Specific validations
      if(type!=="post") throw "Type has to be a post in this very case scenario";
    } catch(e)
    {
      return res.status(400).render('admin/postEntity',{title:"POST DATA",hasData:false,error:e});
    }
    try{
      object = await adminController.deleteOne(type,id);
    }catch(e)
    {
      return res.status(404).render('admin/postEntity',{title:"POST DATA",hasData:false,error:e});
    }
    //console.log("\nDeleted Object is:",object);
    return res.redirect('/api/v1/admin/manage');
  })







  // router.
  // route("/")
  // .get(restrict,async(req,res) =>{ 
  //   return res.status(200).render('admin-usertrainerpage',{title:"USER / TRAINER / GYMS",error:req.admin._id});
  // })
  // .post(restrict,async(req,res) =>{ 
  // })

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


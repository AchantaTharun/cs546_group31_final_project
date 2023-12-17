import Admin from "../models/adminModel.js";
import Gym from "../models/gymModel.js";
import Event from "../models/eventModel.js"
import Trainer from "../models/trainerModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import SignUpRequest from "../models/signUpRequestModel.js";
import RejectedRequest from "../models/rejectedRequestModel.js";
import mongoose from "mongoose";
import * as help from "../Helpers.js";
import * as e_valid from 'email-validator';
import {ObjectId} from 'mongodb';
import  nodemailer from "nodemailer";
import dotenv from "dotenv";
// dotenv.config({ path: "../.env" });   //This was the issue, why my Emails were not being sent.
import Image from "../models/imageModel.js";

// This is the one and only Administrator created during the running of the seed file.
export const makeAdmin = async (firstAdmin) => {
  await mongoose.connect("mongodb://localhost:27017/GymMate", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const admin = await Admin.create(firstAdmin); //Mongoose will automatically validate the data itself.
  //console.log("Admin created successfully", admin);
  mongoose.disconnect();
};

export const sendEmail = (sendto,decision,reason) => 
{
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAILUSER,
      pass: process.env.MAILPASSWORD
    },
  });
  const mailOptions = {
    from:{
        name: "Gym Mate Application",
        address: process.env.MAILUSER
    },
    to : sendto,
    subject: `Status Change For your account`,
    text: `Your Account has been ${decision} | The reason is : ${reason}`
}
// //console.log(process.env.MAILUSER);
// //console.log(process.env.MAILPASSWORD);

  try{
    transporter.sendMail(mailOptions);
    //console.log("The Mail Was Sent");
  } catch(e)
  {
    throw "Problem in Sending the Email";
  }

};

export const adminLogin = async (emailAddress, password) => {
  if(!emailAddress || !password) throw "Both email Address and Password has to be provided";
  
  //Initial modifications
  if(typeof emailAddress!=='string') throw "Email address is not of valid data type";
  emailAddress = emailAddress.trim().toLowerCase();

  //Validations
  if(!e_valid.validate(emailAddress)) throw "Email address invalid";
  password = help.checkPassword(password);
  //Everything Validated
  const adminUser = await Admin.findOne({ email:emailAddress })//.select("+password");
  if (
      !adminUser ||
      !(await adminUser.isPasswordCorrect(password, adminUser.password))
    ) 
    {
      throw  "Incorrect email or password";
    }
  return  adminUser;
};

export const passwordChange = async (emailAddress, oldPassword, newPassword,confirmPassword) => {
  if(!emailAddress || !oldPassword || !newPassword || !confirmPassword) throw "Some Fields are missing";
  
  //Initial modifications
  if(typeof emailAddress!=='string') throw "Email address is not of valid data type";
  emailAddress = emailAddress.trim().toLowerCase();

  //Validations
  if(!e_valid.validate(emailAddress)) throw "Email address invalid";
  oldPassword = help.checkPassword(oldPassword);
  newPassword = help.checkPassword(newPassword);
  confirmPassword = help.checkPassword(confirmPassword);
  //Everything Validated

  const adminUser = await Admin.findOne({ email:emailAddress })
  // //console.log("Initial Instance",adminUser);
  if (
      !adminUser ||
      !(await adminUser.isPasswordCorrect(oldPassword, adminUser.password))
    ) 
    {
      throw  "Incorrect email or password";
    }

  //We also have to check if the new password is not the same as the old password
  if (
    !adminUser ||
    (await adminUser.isPasswordCorrect(newPassword, adminUser.password))
  ) 
  {
    throw  "New Password cannot be same as the Old Password";
  }
  // we have the adminUser object and now we can change the password.
  adminUser.password = newPassword;
  adminUser.passwordConfirm = confirmPassword;
  let currentTimestamp = Date.now();
  adminUser.passwordChangedAt = currentTimestamp;  //So that the old token can be revoked and the new one can be generated.
  adminUser.updatedAt = currentTimestamp;
  adminUser.save();
  return  { changedPasswordAdmin: true };
};


export const statusChange = async (status,id,type,reason) => {
    let object = undefined;

    if(!status || !id || !type || !reason) throw "Some Fields are missing";
    if(typeof reason!=="string" || reason.trim()==="") throw "Reason is not reasonable";


    //Initial validations
    if(status !=="approved" && status !=="rejected") throw "Status has to be either Accepted or Rejected";
    id = help.checkId(id);
    if(type!=="trainer" && type!=="gym") throw "Type has to be either trainer or gym in this very case scenario";
    
    if(type==="trainer")
    {
      object = await Trainer.findByIdAndUpdate(id,{status: status},{new:true});
    }
    else if(type==="gym")
    {
      object = await Gym.findByIdAndUpdate(id,{status: status},{new:true});
    }

    //It has to be initialized by this point.
    if (!object) {
      throw `No ${type} found with ${id} ID`;
    }

    //Add the information above into the reject request panel, but only if the value is rejected
    if(status==="rejected"){
      let rejectedRequestObject = {requestType: type,
      email: object.email,
      phone:object.phone,
      reason: reason,
      address: {
        street: object.address.street,
        city: object.address.city,
        state: object.address.state,
        zip: object.address.zip
      }};

      const results = await RejectedRequest.create(rejectedRequestObject); 
      // //console.log("Rejected Request Object created and saved successfully", results);
    }

    //send an email, using the nodemailer module
    sendEmail(object.email,status,reason);

    //Delete the main object now
    if(status==="rejected")
    {
      //Somthing has to be deleted.
      let removeObject = undefined;
      if(type === "trainer"){
        removeObject = await Trainer.findOneAndDelete({_id: object._id});
      }
      else if(type === "gym")
      {
        removeObject = await Gym.findOneAndDelete({_id: object._id});
      }
      if (!removeObject) {
        throw `The ${type} data could not be deleted`;
      }
      //console.log("The main object was deleted");

    }
    
    //This is always supposed to be done 
    const removeRequest = await SignUpRequest.findOneAndDelete({requestedBy: id});
    if (!removeRequest) {
      throw "No Sign Up request could be found with this ID and hence nothing was deleted";
    }

};

export const getAllRequestReports = async () =>
{
  const reportRequests = await RejectedRequest.find({}).select('_id requestType email phone reason').sort({ rejectedAt: 'asc' }).exec();
  if (!reportRequests) {
    throw "No Rejected Requests are there in the system";
  }
  return reportRequests;   
};

export const getAllSignUpRequests = async () =>
{
  const signUpRequests = await SignUpRequest.find({}).select('-_id requestType requestedBy').sort({ createdAt: 'asc' }).exec();
    if (!signUpRequests) {
      throw "No Sign Up Requests are there in the system";
    }
  return signUpRequests;
};

export const getOneRequestReport = async (id) =>{

  //Validating the input parameters..
  if(!id) throw "Id Parameter is missing";
  id = help.checkId(id);

  const rprtRequest = await RejectedRequest.findOne({ _id:id });
  if (!rprtRequest) {
    throw "No Rejected Request found";
  }
  return rprtRequest; 
};

export const getOneSignUpRequest = async (id) =>{

  //Validating the input parameters..
  if(!id) throw "Id Parameter is missing";
  id = help.checkId(id);

  const signUpRequest = await SignUpRequest.findOne({ _id:id }).select('_id requestType requestedBy').exec();
  if (!signUpRequest) {
    throw "No Sign Up Request found";
  }
  return signUpRequest; 
};


export const createEvent = async (
  img,
  title,
  description,
  contactEmail,
  streetAddress,
  city,
  state,
  zipCode,
  maxCapacity,
  priceOfAdmission,
  eventDate,
  startTime,
  endTime,
  totalNumberOfAttendees
) => {
  if(!img || !title || !description || !contactEmail || !streetAddress || !city || !state || !zipCode
    || !maxCapacity || (!priceOfAdmission && priceOfAdmission !== 0) || !eventDate || !startTime || !endTime || (!totalNumberOfAttendees && totalNumberOfAttendees !==0))
    throw "Some input Parameters are missing";
  
  img = help.checkString(img);
  title = help.checkString(title);
  description = help.checkString(description);
  if(typeof contactEmail !=='string') throw "Email has to be a string";
  contactEmail = contactEmail.trim();
  if(!e_valid.validate(contactEmail)) throw "The Email provided is not valid";
  streetAddress = help.checkString(streetAddress);
  city = help.checkString(city);
  state = help.checkState(state);  //Remember that you still have to add these two functions.
  zipCode = help.checkZip(zipCode);
  if(typeof maxCapacity!=='number' || maxCapacity<=0 || !Number.isInteger(maxCapacity)) throw "Max capacity value is invalid";
  if(typeof priceOfAdmission!=='number' || priceOfAdmission < 0) throw "Price of Admission has an invalid value";
  // if(!help.isDate(eventDate)) throw "THe event date value is not proper";

  
  //Just making sure that the date strings are in the right format.
  eventDate = help.checkString(eventDate);
  if(!help.dateCheck(eventDate)) throw "Event Date couldn't be parsed";

  startTime = help.checkString(startTime);

  if(!help.dateCheck(startTime)) throw "Start time couldn't be parsed";
  endTime = help.checkString(endTime);

  if(!help.dateCheck(endTime)) throw "End time couldn't be parsed";
  
  //Validating the date strings order.
  if(!help.isEarlierInSameDay(new Date(startTime),new Date(endTime))) throw "Start time and End time should be on the same day";
  if(!help.isEarlierInSameDay(new Date(startTime),new Date(eventDate))) throw "Event Date and Start time should be on the same day";
  if((new Date()) > (new Date(eventDate))) throw "You cannot have an event date and time in the past";
  if((new Date(eventDate)) > (new Date(startTime))) throw "You cannot have an event Start date and time in the past";
  if((new Date(startTime)) >= (new Date(endTime))) throw "You cannot have an event date and time in the past";
  
  
  if(typeof totalNumberOfAttendees !=='number' || totalNumberOfAttendees > maxCapacity) throw "Number of attendees are invalid";
  //Validations are completed

  //Create an event and then just basically store it in the database.
  const eventbyAdmin = {
    img : img,
    title : title,
    description : description,
    contactEmail : contactEmail,
    eventLocation:
    { 
        streetAddress : streetAddress,
        city : city,
        state : state,
        zipCode : zipCode
    },
    maxCapacity : maxCapacity,
    priceOfAdmission : priceOfAdmission,
    eventDate:new Date(eventDate),
    startTime : new Date(startTime),
    endTime : new Date(endTime),
    totalNumberOfAttendees : totalNumberOfAttendees
  }

  const adminEvent = await Event.create(eventbyAdmin);

  if(!adminEvent)
  {
    throw "Event couldn't be created";
  } 
  return adminEvent;
};

export const getOne = async (type,id) => {
  //validations
  if(!type || !id) throw "Certain input parameters are missing";
  if(typeof type!=='string') throw "Collection type must be in string format";
  type=type.trim();
  if(type!=='user' && type!=='trainer' && type!=='gym' && type!=='event' && type!=='post') throw "Invalid Collection type was passed";
  id = help.checkId(id);

  let object = undefined; 
  if(type==='user')
  {
    object = await User.findById(id).select('-password').exec();
  }
  else if(type==='trainer')
  {
    object = await Trainer.findById(id).select('-password').exec();
  }
  if(type==='gym')
  {
    object = await Gym.findById(id).select('-password').exec();
  }
  else if(type==='event')
  {
    object = await Event.findById(id);
  }
  if(type==='post')
  {
    object = await Post.findById(id);
  }

  if(!object) throw `No ${type} found with that Id`;
  return object;
  
};

export const getAll = async (type) => {
  //validations
  if(!type) throw "Input missing";
  if(typeof type!=='string') throw "Collection type must be in string format";
  type=type.trim();
  if(type!=='user' && type!=='trainer' && type!=='gym' && type!=='event' && type!=='post') throw "Invalid Collection type was passed";

  let object = undefined; 
  if(type==='user')
  {
    object = await User.find({}).select('-password').exec();
  }
  else if(type==='trainer')
  {
    object = await Trainer.find({}).select('-password').exec();
  }
  if(type==='gym')
  {
    object = await Gym.find({}).select('-password').exec();
  }
  else if(type==='event')
  {
    object = await Event.find({});
  }
  if(type==='post')
  {
    object = await Post.find({});
  }

  if(!object) throw `No ${type} list could be found in the Database`;
  return object;

};

export const getSome = async (type,name) => {
  if(!type || !name ) throw "Certain input parameters are missing";
  if(typeof type!=='string') throw "Collection type must be in string format";
  type=type.trim();
  if(type!=='user' && type!=='trainer' && type!=='gym' && type!=='event' && type!=='post') throw "Invalid Collection type was passed";
  name = help.checkString(name);

  name = new RegExp(name,'gi');

  let object = undefined; 
  if(type==='user')
  {
    object = await User.find({lastName:name}).select('-password').exec();
  }
  else if(type==='trainer')
  {
    object = await Trainer.find({trainerName: name}).select('-password').exec();
  }
  if(type==='gym')
  {
    object = await Gym.find({gymName: name}).select('-password').exec();
  }
  else if(type==='event')
  {
    object = await Event.find({title: name});
  }
  if(type==='post')
  {
    object = await Post.find({title: name});
  }

  if(!object) throw `Not one ${type} found with that description`;
  return object;
};

export const deleteOne = async (type,id) => {
  //validations
  if(!type || !id) throw "Certain input parameters are missing";
  if(typeof type!=='string') throw "Collection type must be in string format";
  type=type.trim();
  if(type!=='user' && type!=='trainer' && type!=='gym' && type!=='event' && type!=='post') throw "Invalid Collection type was passed";
  id = help.checkId(id);

  let object = undefined; 
  let deletedSignUpRequest = undefined;
  if(type==='user')
  {
    object = await User.findOneAndDelete({_id: id});
    sendEmail(object.email,'eliminated',"You have broken the application's policy.");
  }
  else if(type==='trainer')
  {
    object = await Trainer.findOneAndDelete({_id: id});
    sendEmail(object.email,'eliminated',"You have broken the application's policy.");
    if(object.status === "pending")
    {
      deletedSignUpRequest = await SignUpRequest.findOneAndDelete({requestedBy: id});
      if(!deletedSignUpRequest) throw `${type} type sign up request, by the id: ${id} could not be deleted`;
    }
    
  }
  if(type==='gym')
  {
    object = await Gym.findOneAndDelete({_id: id});
    sendEmail(object.email,'eliminated',"You have broken the application's policy.");
    if(object.status === "pending")
    {
      deletedSignUpRequest = await SignUpRequest.findOneAndDelete({requestedBy: id});
      if(!deletedSignUpRequest) throw `${type} type sign up request, by the id: ${id} could not be deleted`;
    }
  }
  else if(type==='event')
  {
    object = await Event.findOneAndDelete({_id: id});
  }
  if(type==='post')
  {
    object = await Post.findOneAndDelete({_id: id});
  }

  if(!object) throw `${type} type object with id: ${id} could not be deleted`;
  
  return object;
  
}
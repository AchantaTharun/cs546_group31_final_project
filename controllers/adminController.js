import Admin from "../models/adminModel.js";
import Gym from "../models/gymModel.js";
import Trainer from "../models/trainerModel.js";
import SignUpRequest from "../models/signUpRequestModel.js";
import RejectedRequest from "../models/rejectedRequestModel.js";
import mongoose from "mongoose";
import * as help from "../Helpers.js";
import * as e_valid from 'email-validator';
import {ObjectId} from 'mongodb';

// This is the one and only Administrator created during the running of the seed file.
export const makeAdmin = async (firstAdmin) => {
  await mongoose.connect("mongodb://localhost:27017/GymMate", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const admin = await Admin.create(firstAdmin); //Mongoose will automatically validate the data itself.
  console.log("Admin created successfully", admin);
  mongoose.disconnect();
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
  // console.log("Initial Instance",adminUser);
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


export const approveGym = async (req,res) => {
  try {
    const gym = await Gym.findByIdAndUpdate(req.params.gymId, {
      status: "approved",
    });

    if (!gym) {
      throw new Error("No gym found with this id");
    }
    const removeRequest = await SignUpRequest.findOneAndDelete({
      requestedBy: gym._id,
    });
    if (!removeRequest) {
      throw new Error("No request found with this id");
    }

    res.status(200).json({
      status: "success",
      message: "Gym approved successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const rejectGym = async (req, res) => {
  try {
    const gym = await Gym.findByIdAndUpdate(req.params.gymId, {
      status: "rejected",
      reason: req.body.reason,
    });
    if (!gym) {
      throw new Error("No gym found with this id");
    }
    const deletedGym = await Gym.findByIdAndDelete(req.params.gymId);
    if (!deletedGym) {
      throw new Error("No gym found with this id");
    }
    const removeRequest = await SignUpRequest.findOneAndDelete({
      requestedBy: gym._id,
    });
    if (!removeRequest) {
      throw new Error("No request found with this id");
    }
    const rejectedRequest = await RejectedRequest.create({
      requestType: "gym",
      email: gym.email,
      phone: gym.phone,
      reason: req.body.reason,
      address: gym.address,
    });
    if (!rejectedRequest) {
      throw new Error("No request found with this id");
    }
    res.status(200).json({
      status: "success",
      message: "Gym rejected successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const approveTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndUpdate(req.params.trainerId, {
      status: "approved",
    });

    if (!trainer) {
      throw new Error("No trainer found with this id");
    }
    const removeRequest = await SignUpRequest.findOneAndDelete({
      requestedBy: trainer._id,
    });
    if (!removeRequest) {
      throw new Error("No request found with this id");
    }

    res.status(200).json({
      status: "success",
      message: "Trainer approved successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const rejectTrainer = async (req, res) => {
  try {
    if (!req.body.reason) {
      throw new Error("Please provide a reason");
    }
    const trainer = await Trainer.findByIdAndUpdate(req.params.trainerId, {
      status: "rejected",
      reason: req.body.reason,
    });
    if (!trainer) {
      throw new Error("No trainer found with this id");
    }
    const deletedTrainer = await Trainer.findByIdAndDelete(
      req.params.trainerId
    );
    if (!deletedTrainer) {
      throw new Error("No trainer found with this id");
    }
    const removeRequest = await SignUpRequest.findOneAndDelete({
      requestedBy: trainer._id,
    });
    if (!removeRequest) {
      throw new Error("No request found with this id");
    }
    const rejectedRequest = await RejectedRequest.create({
      requestType: "trainer",
      email: trainer.email,
      phone: trainer.phone,
      reason: req.body.reason,
      address: trainer.address,
    });
    if (!rejectedRequest) {
      throw new Error("No request found with this id");
    }
    res.status(200).json({
      status: "success",
      message: "Trainer rejected successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const getAllGymsRequests = async (req, res) => {
  try {
    const requests = await SignUpRequest.find({ requestType: "gym" });
    if (!requests) {
      throw new Error("No requests found");
    }
    res.status(200).json({
      status: "success",
      data: {
        requests,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const getAllTrainersRequests = async (req, res) => {
  try {
    const requests = await SignUpRequest.find({ requestType: "trainer" });
    if (!requests) {
      throw new Error("No requests found");
    }
    res.status(200).json({
      status: "success",
      data: {
        requests,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const getAllRejectedRequestsGyms = async (req, res) => {
  try {
    const requests = await RejectedRequest.find({ requestType: "gym" });
    if (!requests) {
      throw new Error("No requests found");
    }
    res.status(200).json({
      status: "success",
      data: {
        requests,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const getAllRejectedRequestsTrainers = async (req, res) => {
  try {
    const requests = await RejectedRequest.find({ requestType: "trainer" });
    if (!requests) {
      throw new Error("No requests found");
    }
    res.status(200).json({
      status: "success",
      data: {
        requests,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

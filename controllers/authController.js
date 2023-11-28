import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import Gym from "../models/gymModel.js";
import Trainer from "../models/trainerModel.js";
import SignUpRequest from "../models/signUpRequestModel.js";

// const s3 = require("../utils/s3");

// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

// helpers
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

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }
    if (!token) {
      throw new Error("You are not logged in");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    switch (decoded.role) {
      case "user":
        const user = await User.findById(decoded.id);
        if (!user) {
          throw new Error("there is no user with this token");
        }
        console.log(user.passwordChangedAt);
        if (
          "passwordChangedAt" in user &&
          checkTokenValid(user.passwordChangedAt, decoded.iat)
        ) {
          throw new Error(
            "You have recently changed your password, please login again"
          );
        }
        req.user = user;
        break;
      case "admin":
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
          throw new Error("there is no admin with this token");
        }
        if (
          "passwordChangedAt" in admin &&
          checkTokenValid(admin.passwordChangedAt, decoded.iat)
        ) {
          throw new Error(
            "You have recently changed your password, please login again"
          );
        }
        req.admin = admin;
        break;
      case "gym":
        const gym = await Gym.findById(decoded.id);
        if (!gym) {
          throw new Error("there is no gym with this token");
        }
        if (
          "passwordChangedAt" in gym &&
          checkTokenValid(gym.passwordChangedAt, decoded.iat)
        ) {
          throw new Error(
            "You have recently changed your password, please login again"
          );
        }
        req.gym = gym;
        break;
      case "trainer":
        const trainer = await Trainer.findById(decoded.id);
        if (!trainer) {
          throw new Error("there is no trainer with this token");
        }
        if (
          "passwordChangedAt" in trainer &&
          checkTokenValid(trainer.passwordChangedAt, decoded.iat)
        ) {
          throw new Error(
            "You have recently changed your password, please login again"
          );
        }
        req.trainer = trainer;
        break;
    }

    next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const restrictTo = (role) => {
  return (req, res, next) => {
    try {
      let token;

      if (
        role !== "user" &&
        role !== "admin" &&
        role !== "gym" &&
        role !== "trainer"
      ) {
        throw new Error("invalid role");
      }

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer")) {
        token = authHeader.split(" ")[1];
      }
      if (!token) {
        throw new Error("You are not logged in");
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== role) {
        throw new Error("You are not allowed to perform this action");
      }

      next();
    } catch (err) {
      res.status(400).json({
        status: "fail",
        message: err.message,
      });
    }
  };
};

// user
export const userSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
    });

    const token = signJWT(newUser._id, "user");

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
      throw new Error("Incorrect email or password");
    }

    const token = signJWT(user._id, "user");
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }
    const adminUser = await Admin.findOne({ email }).select("+password");

    if (
      !adminUser ||
      !(await adminUser.isPasswordCorrect(password, adminUser.password))
    ) {
      throw new Error("Incorrect email or password");
    }

    const token = signJWT(adminUser._id, "admin");
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// gym
export const gymSignup = async (req, res) => {
  // const file = req.file;
  // console.log(file);
  // try {
  //   const result = await s3.uploadFile(file);
  //   console.log(result);
  //   res.send("done");
  // } catch (err) {
  //   console.log(err);
  //   res.send("error");
  // }
  try {
    const {
      gymName,
      email,
      password,
      passwordConfirm,
      address,
      phone,
      ownerFName,
      ownerLName,
    } = req.body;
    const newGym = await Gym.create({
      gymName,
      email,
      password,
      passwordConfirm,
      address,
      phone,
      ownerFName,
      ownerLName,
    });
    const signUpRequest = await SignUpRequest.create({
      requestedBy: newGym._id,
      requestType: "gym",
    });

    const token = signJWT(newGym._id, "gym");

    res.status(201).json({
      status: "success",
      token,
      data: {
        gym: newGym,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const gymLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }
    const gymUser = await Gym.findOne({ email }).select("+password");
    if (
      !gymUser ||
      !(await gymUser.isPasswordCorrect(password, gymUser.password))
    ) {
      throw new Error("Incorrect email or password");
    }
    const token = signJWT(gymUser._id, "gym");
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

// trainer
export const trainerSignup = async (req, res) => {
  try {
    const { trainerName, email, password, passwordConfirm, address, phone } =
      req.body;
    const newTrainer = await Trainer.create({
      trainerName,
      email,
      password,
      passwordConfirm,
      address,
      phone,
    });
    const signUpRequest = await SignUpRequest.create({
      requestedBy: newTrainer._id,
      requestType: "trainer",
    });

    const token = signJWT(newTrainer._id, "trainer");

    res.status(201).json({
      status: "success",
      token,
      data: {
        trainer: newTrainer,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const trainerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Please provide email and password");
    }

    const trainer = await Trainer.findOne({ email }).select("+password");

    if (
      !trainer ||
      !(await trainer.isPasswordCorrect(password, trainer.password))
    ) {
      throw new Error("Incorrect email or password");
    }
    const token = signJWT(trainer._id, "trainer");
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Gym = require("../models/gymModel");
const Trainer = require("../models/trainerModel");
const SignUpRequest = require("../models/signUpRequestModel");

const s3 = require("../utils/s3");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const signJWT = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
};

exports.userSignup = async (req, res) => {
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

exports.userLogin = async (req, res) => {
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

exports.protect = async (req, res, next) => {
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
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error("there is no user with this token");
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.adminLogin = async (req, res) => {
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

exports.gymSignup = async (req, res) => {
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

exports.restrictTo = (role) => {
  return (req, res, next) => {
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

      if (decoded.role !== role) {
        throw new Error("You are not allowed to perform this action");
      }
      const admin = Admin.findById(decoded.id);
      if (!admin) {
        throw new Error("there is no admin with this token");
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

exports.trainerSignup = async (req, res) => {
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

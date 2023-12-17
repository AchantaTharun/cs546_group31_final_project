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
    console.log(req.cookies);
    if (!req.cookies.jwt) {
      return res.redirect("/");
    }
    token = req.cookies.jwt;
    if (!token) {
      return res.redirect("/");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    switch (decoded.role) {
      case "user":
        const user = await User.findById(decoded.id).lean();
        if (!user) {
          return res.redirect("/");
        }
        if (
          "passwordChangedAt" in user &&
          checkTokenValid(user.passwordChangedAt, decoded.iat)
        ) {
          return res.redirect("/");
        }
        req.user = Object.assign(user);
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
          return res.redirect("/");
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
          return res.redirect("/");
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
          return res.redirect("/");
        }
        req.trainer = trainer;
        break;
    }
    next();
  } catch (err) {
    // res.status(400).json({
    //   status: 'fail',
    //   message: err.message,
    // });
    return res.redirect("/");
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

      if (!req.cookies.jwt) {
        return res.redirect("/");
      }

      token = req.cookies.jwt;
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
    const {
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      latitude,
      longitude,
      userName,
    } = req.body;
    const location = {
      coordinates: [longitude, latitude],
    };
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      location,
      userName,
    });
    if (!newUser) {
      throw new Error("User not created");
    }
    res.redirect("/login");
  } catch (err) {
    if (err.code === 11000) {
      return res.render("user/userSignUp", {
        errors: ["User already exists with the given email"],
        hasErrors: true,
        layout: "main",
      });
    }
    res.render("user/userSignUp", {
      errors: [err.message],
      hasErrors: true,
      layout: "main",
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password, latitude, longitude } = req.body;
    const lng = longitude;
    const lat = latitude;

    if (!email || !password) {
      throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
      throw new Error("Incorrect email or password");
    }

    const token = signJWT(user._id, "user");
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.redirect(`/user/home`);
  } catch (err) {
    res.render("user/userLogin", {
      errors: [err.message],
      hasErrors: true,
      layout: "main",
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
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.redirect("/admin/dashboard");
  } catch (err) {
    res.render("adminSignIn", { errors: [err.message], hasErrors: true });
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
  // console.log(req.body);

  try {
    const {
      gymName,
      email,
      password,
      passwordConfirm,
      street,
      city,
      state,
      zip,
      phone,
      ownerFName,
      ownerLName,
    } = req.body;
    let address = { street: street, city: city, state: state, zip: zip };
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
    res.redirect("/login");
    // res.status(201).json({
    // 	status: "success",
    // 	token,
    // 	data: {
    // 		gym: newGym,
    // 	},
    // });
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
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    return res.redirect("/gym/dashboard");
  } catch (err) {
    res.render("gym/gymLogin", {
      errors: [err.message],
      hasErrors: true,
      layout: "main",
    });
  }
};

// trainer
export const trainerSignup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      street,
      city,
      state,
      zip,
      phone,
    } = req.body;

    const newTrainer = new Trainer({
      firstName,
      lastName,
      trainerName: firstName + " " + lastName,
      email,
      password,
      passwordConfirm,
      address: {
        street,
        city,
        state,
        zip,
      },
      phone,
    });
    if (password !== passwordConfirm) {
      return res.render("trainer/trainerSignUp", {
        errors: ["Password and passwordConfirm should match"],
        hasErrors: true,
        formData: req.body,
      });
    }
    // Validate schema errors
    const validationErrors = newTrainer.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      return res.render("trainer/trainerSignUp", {
        errors,
        hasErrors: true,
        formData: req.body,
      });
    }

    const createdTrainer = await newTrainer.save();

    const signUpRequest = await SignUpRequest.create({
      requestedBy: createdTrainer._id,
      requestType: "trainer",
    });

    const token = signJWT(createdTrainer._id, "trainer");

    res.redirect("/login");
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern.email) {
        return res.render("trainer/trainerSignUp", {
          errors: ["User already exists with the given email"],
          hasErrors: true,
          sendToLogin: true,
          formData: req.body,
        });
      }
      if (err.keyPattern.phone) {
        return res.render("trainer/trainerSignUp", {
          errors: ["User already exists with the given Phone number"],
          hasErrors: true,
          sendToLogin: true,
          formData: req.body,
        });
      }
    }
    return res.render("trainer/trainerSignUp", {
      errors: [err.message],
      hasErrors: true,
      formData: req.body,
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
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.redirect("/trainer/dashboard");
  } catch (err) {
    res.render("trainer/trainerLogin", {
      errors: [err.message],
      hasErrors: true,
      layout: "main",
    });
  }
};

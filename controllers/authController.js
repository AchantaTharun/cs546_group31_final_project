import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';
import Gym from '../models/gymModel.js';
import Trainer from '../models/trainerModel.js';
import SignUpRequest from '../models/signUpRequestModel.js';

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

    if (!req.cookies.jwt) {
      return res.redirect('/login');
    }

    token = req.cookies.jwt;

    if (!token) {
      return res.redirect('/login');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    switch (decoded.role) {
      case 'user':
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.redirect('/login');
        }
        console.log(user.passwordChangedAt);
        if (
          'passwordChangedAt' in user &&
          checkTokenValid(user.passwordChangedAt, decoded.iat)
        ) {
          return res.redirect('/login');
        }
        req.user = user;
        break;
      case 'admin':
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
          throw new Error('there is no admin with this token');
        }
        if (
          'passwordChangedAt' in admin &&
          checkTokenValid(admin.passwordChangedAt, decoded.iat)
        ) {
          return res.redirect('/login');
        }
        req.admin = admin;
        break;
      case 'gym':
        const gym = await Gym.findById(decoded.id);
        if (!gym) {
          throw new Error('there is no gym with this token');
        }
        if (
          'passwordChangedAt' in gym &&
          checkTokenValid(gym.passwordChangedAt, decoded.iat)
        ) {
          return res.redirect('/login');
        }
        req.gym = gym;
        break;
      case 'trainer':
        const trainer = await Trainer.findById(decoded.id);
        if (!trainer) {
          throw new Error('there is no trainer with this token');
        }
        if (
          'passwordChangedAt' in trainer &&
          checkTokenValid(trainer.passwordChangedAt, decoded.iat)
        ) {
          return res.redirect('/login');
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

    return res.redirect('/login');
  }
};

export const restrictTo = (role) => {
  return (req, res, next) => {
    try {
      let token;

      if (
        role !== 'user' &&
        role !== 'admin' &&
        role !== 'gym' &&
        role !== 'trainer'
      ) {
        throw new Error('invalid role');
      }

      if (!req.cookies.jwt) {
        return res.redirect('/login');
      }

      token = req.cookies.jwt;
      if (!token) {
        throw new Error('You are not logged in');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== role) {
        throw new Error('You are not allowed to perform this action');
      }

      next();
    } catch (err) {
      res.status(400).json({
        status: 'fail',
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

    const token = signJWT(newUser._id, 'user');

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.isPasswordCorrect(password, user.password))) {
      throw new Error('Incorrect email or password');
    }

    const token = signJWT(user._id, 'user');
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res.redirect('/user/dashboard');
  } catch (err) {
    res.render('accountSignIn', { errors: [err.message], hasErrors: true });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }
    const adminUser = await Admin.findOne({ email }).select('+password');

    if (
      !adminUser ||
      !(await adminUser.isPasswordCorrect(password, adminUser.password))
    ) {
      throw new Error('Incorrect email or password');
    }

    const token = signJWT(adminUser._id, 'admin');
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res.redirect('/admin/dashboard');
  } catch (err) {
    res.render('adminSignIn', { errors: [err.message], hasErrors: true });
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
      requestType: 'gym',
    });

    const token = signJWT(newGym._id, 'gym');

    res.status(201).json({
      status: 'success',
      token,
      data: {
        gym: newGym,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

export const gymLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }
    const gymUser = await Gym.findOne({ email }).select('+password');
    if (
      !gymUser ||
      !(await gymUser.isPasswordCorrect(password, gymUser.password))
    ) {
      throw new Error('Incorrect email or password');
    }
    const token = signJWT(gymUser._id, 'gym');
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res.redirect('/admin/dashboard');
  } catch (err) {
    res.render('accountSignIn', { errors: [err.message], hasErrors: true });
  }
};

// trainer
export const trainerSignup = async (req, res) => {
  try {
    const {
      trainerName,
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
      trainerName,
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
      return res.render('trainer/trainerSignUp', {
        errors: ['Password and passwordConfirm should match'],
        hasErrors: true,
      });
    }
    // Validate schema errors
    const validationErrors = newTrainer.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      return res.render('trainer/trainerSignUp', {
        errors,
        hasErrors: true,
      });
    }

    const createdTrainer = await newTrainer.save();

    const signUpRequest = await SignUpRequest.create({
      requestedBy: createdTrainer._id,
      requestType: 'trainer',
    });

    const token = signJWT(createdTrainer._id, 'trainer');

    res.redirect('/accountSignIn');
  } catch (err) {
    if (err.code === 11000 && err.keyPattern.email) {
      return res.render('trainer/trainerSignUp', {
        errors: ['User already exists with the given email'],
        hasErrors: true,
      });
    }
    return res.render('trainer/trainerSignUp', {
      errors: [err.message],
      hasErrors: true,
    });
  }
};

export const trainerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Please provide email and password');
    }

    const trainer = await Trainer.findOne({ email }).select('+password');

    if (
      !trainer ||
      !(await trainer.isPasswordCorrect(password, trainer.password))
    ) {
      throw new Error('Incorrect email or password');
    }
    const token = signJWT(trainer._id, 'trainer');
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res.redirect('/trainer/dashboard');
  } catch (err) {
    res.render('accountSignIn', { errors: [err.message], hasErrors: true });
  }
};

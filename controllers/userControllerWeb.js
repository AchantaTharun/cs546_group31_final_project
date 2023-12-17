import User from "../models/userModel.js";
import Trainer from "../models/trainerModel.js";
import Gym from "../models/gymModel.js";
import mongoose from "mongoose";

export const getHomePage = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    const coords = user.location.coordinates;
    console.log(coords);
    let users = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(coords[0]), parseFloat(coords[1])],
          },
          distanceField: "distanceFromSF",
          distanceMultiplier: 0.001,
          spherical: true,
          maxDistance: 30000,
        },
      },
      {
        $match: {
          _id: { $ne: user._id },
        },
      },
    ]);

    let trainers = await Trainer.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(coords[0]), parseFloat(coords[1])],
          },
          distanceField: "distanceFromSF",
          distanceMultiplier: 0.001,
          spherical: true,
          maxDistance: 30000,
        },
      },
      {
        $match: {
          status: "approved",
        },
      },
    ]);

    let gyms = await Gym.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(coords[0]), parseFloat(coords[1])],
          },
          distanceField: "distanceFromSF",
          distanceMultiplier: 0.001,
          spherical: true,
          maxDistance: 30000,
        },
      },
      {
        $match: {
          status: "approved",
        },
      },
    ]);

    if (!users) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    if (!trainers) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    if (!gyms) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    users.forEach((user) => {
      user.followers.users.forEach((follower) => {
        if (follower.toString() === req.user._id.toString()) {
          user.isFollowing = true;
        }
      });
    });
    console.log(trainers);
    trainers.forEach((trainer) => {
      trainer.followers.users.forEach((follower) => {
        if (follower.toString() === req.user._id.toString()) {
          trainer.isFollowing = true;
        }
      });
    });
    console.log(gyms);
    gyms.forEach((gym) => {
      gym.followers.users.forEach((follower) => {
        if (follower.toString() === req.user._id.toString()) {
          gym.isFollowing = true;
        }
      });
    });

    return res.render("user/userHome", {
      layout: "userHome.layout.handlebars",
      users,
      user,
      trainers,
      gyms,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const search = async (req, res) => {
  try {
    const user = req.user;

    const { selectUser, favoriteWorkout, searchType, search } = req.query;
    console.log({ selectUser, favoriteWorkout, searchType, search });
    let query = {};
    let users;
    if (searchType && search) {
      if (searchType.toLowerCase() === "names") {
        if (selectUser === "Trainers") {
          query.$or = [
            { firstName: { $regex: `^${search}`, $options: "i" } },
            { lastName: { $regex: `^${search}`, $options: "i" } },
            { trainerName: { $regex: `^${search}`, $options: "i" } },
          ];
          users = await Trainer.find(query).lean();
        }
        if (selectUser === "Gyms") {
          query.$or = [{ gymName: { $regex: `^${search}`, $options: "i" } }];
          users = await Gym.find(query).lean();
        }

        if (selectUser === "People") {
          query.$or = [
            { firstName: { $regex: `^${search}`, $options: "i" } },
            { lastName: { $regex: `^${search}`, $options: "i" } },
            { userName: { $regex: `^${search}`, $options: "i" } },
          ];
          users = await User.find(query).lean();
        }
      } else if (searchType.toLowerCase() === "location") {
        query.$or = [
          { "address.city": { $regex: `^${search}`, $options: "i" } },
          { "address.state": { $regex: `^${search}`, $options: "i" } },
          { "address.street": { $regex: `^${search}`, $options: "i" } },
        ];
        if (selectUser === "Trainers") {
          users = await Trainer.find(query).lean();
        }
        if (selectUser === "Gyms") {
          users = await Gym.find(query).lean();
        }
        if (selectUser === "People") {
          users = await User.find(query).lean();
        }
      }
    }
    console.log(users);
    if (!users) {
      return res.render("user/userSearch", {
        layout: "userHome.layout.handlebars",
        users,
        user,
      });
    }
    return res.render("user/userSearch", {
      layout: "userHome.layout.handlebars",
      users,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getProfilePage = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    return res.render("user/userProfile", {
      layout: "userProfile.layout.handlebars",
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getUserFromUserName = async (req, res) => {
  try {
    const userRequested = req.user;
    if (!userRequested) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    const userName = req.params.userName;
    const user = await User.findOne({ userName: userName }).lean();
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    return res.render("user/userPage", {
      layout: "profilePage.layout.handlebars",
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    const updatedFields = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      phone: req.body.phone,
      favoriteWorkout: req.body.favoriteWorkout,
      bio: req.body.bio,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      height: req.body.height,
      weight: req.body.weight,
      hUnit: req.body.hUnit,
      wUnit: req.body.wUnit,
      address: {
        street: req.body.street,
        apartment: req.body.apartment,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
      },
    };
    console.log({ updatedFields });
    const updatedUser = await User.findByIdAndUpdate(user._id, updatedFields, {
      new: true,
      runValidators: true,
    }).lean();
    console.log({ updatedUser });
    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    return res.render("user/userEditProfile", {
      layout: "userEditProfile.layout.handlebars",
      user: Object.assign(updatedUser),
    });
  } catch (err) {
    res.status(400).render("user/userEditProfile", {
      layout: "userEditProfile.layout.handlebars",
      user: Object.assign(req.user),
      error: [Object.assign(err.message)],
    });
  }
};

export const getEditProfile = async (req, res) => {
  try {
    const user = Object.assign(req.user);
    const findUser = await User.findById(user._id).lean();
    console.log(findUser);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    console.log(user);
    return res.render("user/userEditProfile", {
      layout: "userEditProfile.layout.handlebars",
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getTrainerProfilePage = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    const userName = req.params.userName;
    const trainer = await Trainer.findOne({ trainerName: userName }).lean();
    if (!trainer) {
      return res.status(404).json({
        status: "fail",
        message: "No trainer found with that ID",
      });
    }
    return res.render("user/trainerProfile", {
      layout: "userProfile.layout.handlebars",
      trainer,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getGymProfilePage = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    const id = req.params.id;
    console.log(id);
    const gym = await Gym.findById(id).lean();
    if (!gym) {
      return res.status(404).json({
        status: "fail",
        message: "No gym found with that ID",
      });
    }
    return res.render("user/gymProfile", {
      layout: "userProfile.layout.handlebars",
      gym,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const followUser = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    console.log({ userId, userType });
    let loggedInUserId = req.user._id;

    let userToUpdate;
    let loggedInUser;

    switch (userType) {
      case "user":
        if (req.user.isUser) {
          userToUpdate = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { "followers.users": loggedInUserId } },
            { new: true }
          );
          loggedInUser = await User.findByIdAndUpdate(
            loggedInUserId,
            { $addToSet: { "following.users": userToUpdate._id } },
            { new: true }
          );
        }
        break;
      case "trainer":
        if (req.user.isUser) {
          userToUpdate = await Trainer.findByIdAndUpdate(
            userId,
            { $addToSet: { "followers.users": loggedInUserId } },
            { new: true }
          );
          loggedInUser = await User.findByIdAndUpdate(
            loggedInUserId,
            { $addToSet: { "following.trainers": userToUpdate._id } },
            { new: true }
          );
        }
        break;
      case "gym":
        if (req.user.isUser) {
          userToUpdate = await Gym.findByIdAndUpdate(
            userId,
            { $addToSet: { "followers.users": loggedInUserId } },
            { new: true }
          );
          loggedInUser = await User.findByIdAndUpdate(
            loggedInUserId,
            { $addToSet: { "following.gyms": userToUpdate._id } },
            { new: true }
          );
        }
        break;
      default:
        return res.status(400).json({ message: "Invalid userType" });
    }

    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!loggedInUser) {
      return res.status(404).json({ message: "Logged in user not found" });
    }

    res
      .status(200)
      .json({ message: "You are now following this user", id: userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unFollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    let loggedInUserId = req.user._id;
    const userToUnFollow = await User.findByIdAndUpdate(
      userId,
      { $pull: { followers: loggedInUserId } },
      { new: true }
    );
    console.log(userToUnFollow);
    if (!userToUnFollow) {
      return res.status(404).json({ message: "User not found" });
    }
    const loggedInUser = await User.findByIdAndUpdate(
      loggedInUserId,
      { $pull: { following: userToUnFollow._id } },
      { new: true }
    );
    console.log(loggedInUser);
    res.status(200).json({ message: "You are no longer following this user" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

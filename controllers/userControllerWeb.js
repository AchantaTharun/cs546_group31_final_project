import User from "../models/userModel.js";
import Trainer from "../models/trainerModel.js";
import Gym from "../models/gymModel.js";
import mongoose from "mongoose";
import Session from "../models/sessionModel.js";
import MealPlan from "../models/mealPlanModel.js"
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
    trainers.forEach((trainer) => {
      trainer.followers.users.forEach((follower) => {
        if (follower.toString() === req.user._id.toString()) {
          trainer.isFollowing = true;
        }
      });
    });
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
    const { selectUser, favoriteWorkout, state } = req.query;

    if (!selectUser) {
      throw new Error("Please select a user type");
    }
    if (selectUser === "Gyms") {
      if (!state) {
        throw new Error("Please select a search type and enter a search term");
      }
    }
    if (selectUser !== "Gyms" && !favoriteWorkout && !state) {
      throw new Error(
        "Please select a favorite workout and enter a search term"
      );
    }
    if (!["Trainers", "People", "Gyms"].includes(selectUser)) {
      throw new Error("Please select a search type and enter a search term");
    }

    if (
      selectUser !== "Gyms" &&
      ![
        "cardio",
        "strength",
        "flexibility",
        "sports",
        "crossFit",
        "bodyWeight",
      ].includes(favoriteWorkout)
    ) {
      throw new Error("Please select a search type and enter a search term");
    }
    let users;
    let trainers;
    let gyms;
    let query = {};

    query.$or = [{ "address.state": { $regex: `^${state}`, $options: "i" } }];
    if (selectUser === "Trainers") {
      query.workoutType = { $in: [favoriteWorkout] };
      trainers = await Trainer.find(query).lean();
    }
    if (selectUser === "Gyms") {
      gyms = await Gym.find(query).lean();
    }
    if (selectUser === "People") {
      query.workoutType = favoriteWorkout;
      users = await User.find(query).lean();
    }

    if (trainers) {
      trainers.forEach((trainer) => {
        trainer.followers.users.forEach((follower) => {
          if (follower.toString() === req.user._id.toString()) {
            trainer["isFollowing"] = true;
          }
        });
      });
    }

    if (gyms) {
      gyms.forEach((gym) => {
        gym.followers.users.forEach((follower) => {
          if (follower.toString() === req.user._id.toString()) {
            gym["isFollowing"] = true;
          }
        });
      });
    }

    if (users) {
      users.forEach((user) => {
        user.followers.users.forEach((follower) => {
          if (follower.toString() === req.user._id.toString()) {
            user["isFollowing"] = true;
          }
        });
      });
    }
    return res.render("user/userSearch", {
      layout: "userHome.layout.handlebars",
      users,
      gyms,
      trainers,
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
      layout: "userPage.layout.handlebars",
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getTrainerSessionsPage = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    const trainerName = req.params.trainerName;
    const trainer = await Trainer.findOne({ trainerName: trainerName })
      .populate("sessions")
      .lean();
    if (!trainer) {
      return res.status(404).json({
        status: "fail",
        message: "No trainer found with that ID",
      });
    }
    let sessions = trainer.sessions;

    sessions.forEach((session) => {
      session.registeredUsers.forEach((user) => {
        if (user.userId.toString() === req.user._id.toString()) {
          session.isRegistered = true;
        }
      });
    });
    return res.render("user/trainerProfile", {
      layout: "trainerProfilePage.layout.handlebars",
      sessions: trainer.sessions,
      hasSessions: true,
      trainer,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getTrainerFollowingPage = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    const trainerName = req.params.trainerName;
    const trainer = await Trainer.findOne({ trainerName: trainerName })
      .populate("following.users")
      .populate("following.gyms")
      .populate("following.trainers")
      .lean();
    if (!trainer) {
      return res.status(404).json({
        status: "fail",
        message: "No trainer found with that ID",
      });
    }
    let following = trainer.following;
    let followingUsers = following.users;
    let followingGyms = following.gyms;
    let followingTrainers = following.trainers;
    return res.render("user/trainerProfile", {
      layout: "trainerProfilePage.layout.handlebars",
      hasFollowing: true,
      followingUsers,
      followingGyms,
      followingTrainers,
      trainer,
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
    const updatedUser = await User.findByIdAndUpdate(user._id, updatedFields, {
      new: true,
      runValidators: true,
    }).lean();
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
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
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
    let trainer = await Trainer.findOne({ trainerName: userName })
      .populate("sessions")
      .lean();
    if (!trainer) {
      return res.status(404).json({
        status: "fail",
        message: "No trainer found with that ID",
      });
    }
    trainer.followers.users.forEach((follower) => {
      if (follower.toString() === req.user._id.toString()) {
        trainer["isFollowing"] = true;
      }
    });
    return res.render("user/trainerProfile", {
      layout: "trainerProfilePage.layout.handlebars",
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
    const gym = await Gym.findById(id).lean();
    if (!gym) {
      return res.status(404).json({
        status: "fail",
        message: "No gym found with that ID",
      });
    }
    return res.render("user/gymProfile", {
      layout: "gymProfilePage.layout.handlebars",
      gym,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};
export const getGymFollowersPage = async (req, res) => {
  try {
    const user = req.user;
    const gymId = req.params.id;
    const gym = await Gym.findById(gymId)
      .populate("followers.users")
      .populate("followers.gyms")
      .populate("followers.trainers")
      .lean();
    if (!gym) {
      return res.status(404).json({
        status: "fail",
        message: "No gym found with that ID",
      });
    }
    const followers = gym.followers;
    const followerUsers = followers.users;
    const followerTrainers = followers.trainers;
    const followerGyms = followers.gyms;
    return res.render("user/gymProfile", {
      layout: "gymProfilePage.layout.handlebars",
      hasFollowers: true,
      followerUsers,
      followerGyms,
      followerTrainers,
      gym,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const followUser = async (req, res) => {
  try {
    const { userId, userType } = req.params;
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
    if (!userToUnFollow) {
      return res.status(404).json({ message: "User not found" });
    }
    const loggedInUser = await User.findByIdAndUpdate(
      loggedInUserId,
      { $pull: { following: userToUnFollow._id } },
      { new: true }
    );
    res.status(200).json({ message: "You are no longer following this user" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTrainerFollowersPage = async (req, res) => {
  try {
    const user = req.user;
    const trainerName = req.params.trainerName;
    const trainer = await Trainer.findOne({ trainerName: trainerName })
      .populate("followers.users")
      .populate("followers.gyms")
      .populate("followers.trainers")
      .lean();
    if (!trainer) {
      return res.status(404).json({
        status: "fail",
        message: "No trainer found with that ID",
      });
    }
    let followers = trainer.followers;
    let followerUsers = followers.users;
    let followerGyms = followers.gyms;
    let followerTrainers = followers.trainers;
    return res.render("user/trainerProfile", {
      layout: "trainerProfilePage.layout.handlebars",
      hasFollowers: true,
      followerUsers,
      followerGyms,
      followerTrainers,
      trainer,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getTrainersPostsPage = async (req, res) => {
  try {
    const user = req.user;
    const trainerName = req.params.trainerName;
    const trainer = await Trainer.findOne({ trainerName: trainerName })
      .populate("posts")
      .lean();
    if (!trainer) {
      return res.status(404).json({
        status: "fail",
        message: "No trainer found with that ID",
      });
    }
    let posts = trainer.posts;
    return res.render("user/trainerProfile", {
      layout: "trainerProfilePage.layout.handlebars",
      hasPosts: true,
      posts,
      trainer,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getMYFollowersPage = async (req, res) => {
  try {
    const user = req.user;
    const populatedUser = await User.findById(user._id)
      .populate("followers.users")
      .populate("followers.gyms")
      .populate("followers.trainers")
      .lean();

    const followers = populatedUser.followers;
    const followerUsers = followers.users;
    const followerTrainers = followers.trainers;
    const followerGyms = followers.gyms;

    return res.render("user/userProfile", {
      layout: "userProfile.layout.handlebars",
      hasFollowers: true,
      followerUsers,
      followerGyms,
      followerTrainers,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getMYFollowingPage = async (req, res) => {
  try {
    const user = req.user;
    const populatedUser = await User.findById(user._id)
      .populate("following.users")
      .populate("following.gyms")
      .populate("following.trainers")
      .lean();

    const following = populatedUser.following;
    const followingUsers = following.users;
    const followingTrainers = following.trainers;
    const followingGyms = following.gyms;
    return res.render("user/userProfile", {
      layout: "userProfile.layout.handlebars",
      hasFollowing: true,
      followingUsers,
      followingGyms,
      followingTrainers,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getMYSessionsPage = async (req, res) => {
  try {
    const user = req.user;
    const mySessions = await Session.find({
      registeredUsers: { $elemMatch: { userId: user._id } },
    }).lean();
    return res.render("user/userProfile", {
      layout: "userProfile.layout.handlebars",
      hasSessions: true,
      sessions: mySessions,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getMYMealsPage = async (req, res) => {
  try {
    const user = req.user;
    const mmeals = await MealPlan.find({
      assignedTo: user._id }
    ).lean();
    return res.render("user/userProfile", {
      layout: "userProfile.layout.handlebars",
      hasMeals: true,
      mmeals: mmeals,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getUserFollowersPage = async (req, res) => {
  const user = req.user;
  const userName = req.params.userName;
  try {
    const populatedUser = await User.findOne({ userName: userName })
      .populate("followers.users")
      .populate("followers.gyms")
      .populate("followers.trainers")
      .lean();

    const followers = populatedUser.followers;
    const followerUsers = followers.users;
    const followerTrainers = followers.trainers;
    const followerGyms = followers.gyms;

    return res.render("user/userPage", {
      layout: "userPage.layout.handlebars",
      hasFollowers: true,
      followerUsers,
      followerGyms,
      followerTrainers,
      populatedUser,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getUserFollowingPage = async (req, res) => {
  const user = req.user;
  const userName = req.params.userName;
  try {
    const populatedUser = await User.findOne({ userName: userName })
      .populate("following.users")
      .populate("following.gyms")
      .populate("following.trainers")
      .lean();
    const following = populatedUser.following;
    const followingUsers = following.users;
    const followingTrainers = following.trainers;
    const followingGyms = following.gyms;
    return res.render("user/userPage", {
      layout: "userPage.layout.handlebars",
      hasFollowing: true,
      followingUsers,
      followingGyms,
      followingTrainers,
      populatedUser,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getUserPostsPage = async (req, res) => {
  const user = req.user;
  const userName = req.params.userName;
  try {
    const populatedUser = await User.findOne({ userName: userName })
      .populate("posts")
      .lean();
    const posts = populatedUser.posts;

    return res.render("user/userPage", {
      layout: "userPage.layout.handlebars",
      hasPosts: true,
      posts,
      populatedUser,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

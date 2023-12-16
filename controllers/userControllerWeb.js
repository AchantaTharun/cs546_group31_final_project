import User from "../models/userModel.js";
import Trainer from "../models/trainerModel.js";
import Gym from "../models/gymModel.js";

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
    const users = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(coords[0]), parseFloat(coords[1])],
          },
          distanceField: "distanceFromSF",
          distanceMultiplier: 0.001,
          spherical: true,
          maxDistance: 15000,
        },
      },
      {
        $match: {
          _id: { $ne: user._id },
        },
      },
    ]);

    const trainers = await Trainer.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(coords[0]), parseFloat(coords[1])],
          },
          distanceField: "distanceFromSF",
          distanceMultiplier: 0.001,
          spherical: true,
          maxDistance: 15000,
        },
      },
      {
        $match: {
          status: "approved",
        },
      },
    ]);

    const gyms = await Gym.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(coords[0]), parseFloat(coords[1])],
          },
          distanceField: "distanceFromSF",
          distanceMultiplier: 0.001,
          spherical: true,
          maxDistance: 15000,
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
    console.log(user);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    return res.render("user/userPage", {
      layout: "main.handlebars",
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
    const { firstName, lastName, favoriteWorkout, location } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        firstName,
        lastName,
        favoriteWorkout,
        location,
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    return res.render("user/userProfile", {
      layout: "userProfile.layout.handlebars",
      user: updatedUser,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const getEditProfile = async (req, res) => {
  try {
    const user = req.user;

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

export const editProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      bio,
      firstName,
      lastName,
      email,
      dialingCode,
      phoneNumber,
      dateOfBirth,
      gender,
      height,
      hUnit,
      weight,
      wUnit,
      favoriteWorkout,
      street,
      apartment,
      city,
      state,
      zip,
    } = req.body;

    await User.findByIdAndUpdate(userId, {
      bio,
      firstName,
      lastName,
      email,
      dialingCode,
      phoneNumber,
      dateOfBirth,
      gender,
      height,
      hUnit,
      weight,
      wUnit,
      favoriteWorkout,
      address: {
        street,
        apartment,
        city,
        state,
        zip,
      },
    });

    res.redirect("/user/profile");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

import User from "../models/userModel.js";
import Trainer from "../models/trainerModel.js";
import Gym from "../models/gymModel.js";

export const getHomePage = async (req, res) => {
  try {
    const user = req.user;
    const { lat, lng } = req.query;
    console.log({ lat, lng });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    const coords = user.location.coordinates;
    console.log(coords);
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
      layout: "main.handlebars",
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
      layout: "main.handlebars",
      gym,
    });
  } catch (err) {
    console.log(err.message);
  }
};

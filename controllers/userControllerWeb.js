import User from "../models/userModel.js";

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
    console.log(user);
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
    console.log(users);
    if (!users) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    return res.render("user/userHome", {
      layout: "userHome.layout.handlebars",
      users,
      user,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const search = async (req, res) => {
  try {
    const user = req.user;

    const { selectUser, favoriteWorkout, searchType, search } = req.query;
    let query = {};

    if (favoriteWorkout) {
      query.favoriteWorkout = favoriteWorkout;
    }

    if (searchType && search) {
      if (searchType.toLowerCase() === "names") {
        query.$or = [
          { firstName: { $regex: `^${search}`, $options: "i" } },
          { lastName: { $regex: `^${search}`, $options: "i" } },
        ];
      } else if (searchType.toLowerCase() === "location") {
        query.location = { $regex: `^${search}`, $options: "i" };
      }
    }
    const users = await User.find(query).lean();
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

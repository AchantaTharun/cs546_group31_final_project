import User from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).lean();
    if (!users) {
      return res.status(404).json({
        status: "fail",
        message: "No users have been made yet",
      });
    }
    console.log(users);
    return res.status(200).json({
      status: "success",
      results: users.length,
      data: {
        users,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

export const getUser = async (req, res) => {
  try {
    console.log(req.params.userName);
    const user = await User.findOne({ userName: req.params.userName });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    res.render("user/userPage", {
      layout: "main.handlebars",
      user,
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

export const getFromCoord = async (req, res) => {
  try {
    const { lng, lat } = req.query;
    const users = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distanceFromSF",
          distanceMultiplier: 0.001,
          spherical: true,
          maxDistance: 15000,
        },
      },
    ]);
    // console.log(users);
    if (!users) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    return res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

export const search = async (req, res) => {
  try {
    const { selectUser, favoriteWorkout, searchType, search } = req.query;
    let query = {};
    if (favoriteWorkout) {
      query.favoriteWorkout = favoriteWorkout;
    }

    if (searchType && search) {
      if (searchType.toLowerCase() === "names") {
        console.log("inside");
        query.$or = [
          { firstName: { $regex: `^${search}`, $options: "i" } },
          { lastName: { $regex: `^${search}`, $options: "i" } },
        ];
      } else if (searchType.toLowerCase() === "location") {
        query.location = { $regex: `^${search}`, $options: "i" };
      }
    }
    const user = await User.find(query);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID",
      });
    }
    return res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (e) {
    return res.status(500).json({
      status: "fail",
      message: e.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const {
    firstName,
    lastName,
    userName,
    email,
    location,
    favoriteWorkout,
    bio,
    dateOfBirth,
    gender,
    height,
    weight,
    hUnit,
    wUnit,
    address,
  } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.userName = userName;
    user.email = email;
    user.location = location;
    user.favoriteWorkout = favoriteWorkout;
    user.bio = bio;
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;
    user.height = height;
    user.weight = weight;
    user.hUnit = hUnit;
    user.wUnit = wUnit;
    user.address = address;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

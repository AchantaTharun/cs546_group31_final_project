import User from "../models/userModel.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
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
    const user = await User.findById(req.params.id);
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

export const getFromCoord = async (req, res) => {
  try {
    const { lng, lat } = req.query;
    console.log("inside");
    const user = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: "distance",
          distanceMultiplier: 0.001,
        },
      },
    ]);
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

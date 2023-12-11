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

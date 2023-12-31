import Trainer from "../models/trainerModel.js";
import Session from "../models/sessionModel.js";
import User from "../models/userModel.js";
import MealPlan from "../models/mealPlanModel.js";
import mongoose from "mongoose";

export const renderTrainerSessions = async (req, res) => {
  try {
    const trainer = req.trainer;
    const sessionIds = trainer.sessions;
    const activeSessions = await Session.find({
      _id: { $in: sessionIds },
      isActive: true,
    }).lean();
    const inactiveSessions = await Session.find({
      _id: { $in: sessionIds },
      isActive: false,
    }).lean();
    res.render("trainer/trainerSessions", {
      trainer: trainer.toObject(),
      trainerId: trainer._id.toString(),
      activeSessions,
      inactiveSessions,
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    res.render("trainer/trainerSessions", {
      trainer: req.trainer.toObject(),
      trainerId: req.trainer._id.toString(),
      errors: [
        "Some error occured during loading trainer sessions page, Please contact Administator!",
      ],
      type: "trainer",
      layout: "trainerHome",
    });
  }
};

export const renderTrainerMealPlans = async (req, res) => {
  try {
    const trainer = req.trainer;
    const sessionIds = trainer.sessions;
    const mealPlanIds = trainer.mealPlans;
    const mealplans = await MealPlan.find({
      _id: { $in: mealPlanIds },
    }).lean();

    for (const meal of mealplans) {
      const user = await User.findOne({
        _id: meal.assignedTo.toString(),
      }).lean();
      if (user) meal.assignedTo = user.userName;
    }
    const activeSessions = await Session.find({
      _id: { $in: sessionIds },
      isActive: true,
    }).lean();
    res.render("trainer/trainerMealPlans", {
      trainer: trainer.toObject(),
      trainerId: trainer._id.toString(),
      mealplans,
      activeSessions,
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    res.render("trainer/trainerMealPlans", {
      trainer: req.trainer.toObject(),
      trainerId: req.trainer._id.toString(),
      type: "trainer",
      layout: "trainerHome",
      errors: [
        "Some error occured during loading meal plans page, Please contact Administator!",
      ],
    });
  }
};

export const renderTrainerFollowers = async (req, res) => {
  try {
    const trainer = req.trainer;
    const followersId = trainer.followers.users;
    
    const followers = await User.find({
      _id: { $in: followersId },
    }).lean();

    
    res.render("trainer/trainerFollowers", {
      trainer: trainer.toObject(),
      trainerId: trainer._id.toString(),
      followers,
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    res.render("trainer/trainerFollowers", {
      trainer: req.trainer.toObject(),
      trainerId: req.trainer._id.toString(),
      type: "trainer",
      layout: "trainerHome",
      errors: [
        "Some error occured during loading followers page, Please contact Administator!",
      ],
    });
  }
};

export const renderTrainerMealPlansCreate = async (req, res) => {
  try {
    const trainer = req.trainer;
    const sessionIds = trainer.sessions;
    const mealPlanIds = trainer.mealPlans;
    const mealplans = await MealPlan.find({
      _id: { $in: mealPlanIds },
    }).lean();

    for (const meal of mealplans) {
      const user = await User.findOne({
        _id: meal.assignedTo.toString(),
      }).lean();
      if (user) meal.assignedTo = user.userName;
    }
    const activeSessions = await Session.find({
      _id: { $in: sessionIds },
      isActive: true,
    }).lean();

    res.render("trainer/createMealPlan", {
      trainer: trainer.toObject(),
      trainerId: trainer._id.toString(),
      mealplans,
      activeSessions,
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    res.render("trainer/createMealPlan", {
      trainer: req.trainer.toObject(),
      trainerId: req.trainer._id.toString(),
      type: "trainer",
      layout: "trainerHome",
      errors: [
        "Error occured loading create meal plan page, please contact administrator!",
      ],
    });
  }
};

export const renderTrainerMealPlanDelete = async (req, res) => {
  try {
    const trainer = req.trainer;
    const sessionIds = trainer.sessions;
    const mealPlanId = req.params.mealplanId;

    await MealPlan.findByIdAndDelete(mealPlanId);

    const mealPlanIds = trainer.mealPlans;
    const mealplans = await MealPlan.find({
      _id: { $in: mealPlanIds },
    }).lean();

    const activeSessions = await Session.find({
      _id: { $in: sessionIds },
      isActive: true,
    }).lean();
    res.render("trainer/trainerMealPlans", {
      trainer: trainer.toObject(),
      trainerId: trainer._id.toString(),
      mealplans,
      activeSessions,
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    res.render("trainer/trainerMealPlans", {
      trainer: req.trainer.toObject(),
      trainerId: req.trainer._id.toString(),
      type: "trainer",
      layout: "trainerHome",
      deleteErrors: ["Error pre-populating form values"],
    });
  }
};

export const renderTrainerDashboard = async (req, res) => {
  try {
    const trainer = req.trainer;
    const sessionIds = trainer.sessions;
    const activeSessions = await Session.find({
      _id: { $in: sessionIds },
      isActive: true,
    }).lean();
    let totalRegisteredUsersCount = 0;
    for (const ss of activeSessions) {
      totalRegisteredUsersCount =
        totalRegisteredUsersCount + ss.registeredUsers.length;
    }

    const mealPlans = await MealPlan.find({ assignedBy: trainer._id });

    let sessionsByWeekdayAndSlot = await getCurrentWeekSchedule(trainer);
    const weekdays = Object.keys(sessionsByWeekdayAndSlot);
    const timeSlots = [
      ...new Set(
        [].concat(
          ...weekdays.map((day) => Object.keys(sessionsByWeekdayAndSlot[day]))
        )
      ),
    ];

    const { users, trainers, gyms } = trainer.followers;
    const totalFollowers = users.length + trainers.length + gyms.length;
    res.render("trainer/trainerDashboard", {
      trainer: trainer.toObject(),
      activeSessions,
      stats: {
        activeSessionsCount: activeSessions.length,
        totalRegisteredUsersCount,
        totalMealPlans: mealPlans.length,
        totalFollowers,
      },
      sessionsByWeekdayAndSlot,
      weekdays,
      timeSlots,
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    res.render("trainer/trainerDashboard", {
      trainer: req.trainer.toObject(),
      type: "trainer",
      layout: "trainerHome",
      errors: [
        "Some error occured during loading dashboard page, Please contact Administator!",
      ],
    });
  }
};

export const renderTrainerSessionUsers = async (req, res) => {
  try {
    const trainer = req.trainer;
    const sessionId = req.params.sessionId;
    const sessionIds = trainer.sessions;
    const session = await Session.findOne({ _id: sessionId }).lean();
    if (!session) {
      return res.status(404).json({ errors: ["Session not found"] });
    }
    const weekdays = session.sessionSlots.map((slot) => slot.weekday);

    const userIds = session.registeredUsers.map((user) => user.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    res.render("trainer/trainerSessionUsers", {
      trainer: trainer.toObject(),
      trainerId: trainer._id.toString(),
      session,
      startDate: session.startDate.toLocaleDateString(),
      endDate: session.endDate.toLocaleDateString(),
      weekdays,
      users,
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    res.render("trainer/trainerSessionUsers", {
      trainer: req.trainer.toObject(),
      trainerId: req.trainer._id.toString(),
      type: "trainer",
      layout: "trainerHome",
      errors: [
        "Error occured loading session users info, please contact administator!",
      ],
    });
  }
};

export const renderTrainerProfile = async (req, res) => {
  try {
    const trainer = req.trainer;

    res.render("trainer/trainerProfile", {
      trainer: trainer.toObject(),
      trainerId: trainer._id.toString(),
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    res.render("trainer/trainerProfile", {
      trainer: req.trainer.toObject(),
      trainerId: req.trainer._id.toString(),
      type: "trainer",
      layout: "trainerHome",
      errors: [
        "Error occured loading session users info, please contact administator!",
      ],
    });
  }
};

export const renderTrainerProfileInfo = async (req, res) => {
  try {
    const trainer = req.trainer;

    res.render("trainer/trainerProfileInfo", {
      trainer: trainer.toObject(),
      trainerId: trainer._id.toString(),
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    res.render("trainer/trainerProfileInfo", {
      trainer: req.trainer.toObject(),
      trainerId: req.trainer._id.toString(),
      type: "trainer",
      layout: "trainerHome",
      errors: [
        "Error occured loading session users info, please contact administator!",
      ],
    });
  }
};

export const getTrainerDetails = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.trainerId);
    if (!trainer) {
      return res.status(404).json({ errors: ["Trainer not found"] });
    }
    const {
      _id,
      trainerName,
      email,
      address,
      phone,
      status,
      createdAt,
      isTrainer,
      sessions,
    } = trainer;
    res.status(200).json({
      _id,
      trainerName,
      email,
      address,
      phone,
      status,
      createdAt,
      isTrainer,
      sessions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ["Internal Server Error"] });
  }
};

export const updateTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const {
      trainerName,
      email,
      address,
      phone,
      status,
      password,
      passwordConfirm,
    } = req.body;
    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ errors: ["Invalid trainer ID"] });
    }
    if (password !== passwordConfirm) {
      return res
        .status(400)
        .json({ errors: ["Password and passwordConfirm should match"] });
    }
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ errors: ["Trainer not found"] });
    }
    trainer.trainerName = trainerName;
    trainer.email = email;
    trainer.address = address;
    trainer.phone = phone;
    trainer.status = status;
    if (password) {
      trainer.password = password;
    }
    const validationErrors = trainer.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ errors });
    }
    const updatedTrainer = await trainer.save();
    const {
      _id,
      trainerName: updatedName,
      email: updatedEmail,
      status: updatedStatus,
    } = updatedTrainer;
    res.status(200).json({
      message: "Trainer updated successfully",
      trainer: {
        _id,
        trainerName: updatedName,
        email: updatedEmail,
        status: updatedStatus,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ["Internal Server Error"] });
  }
};

export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.trainerId);
    if (!trainer) {
      return res.status(404).json({ errors: ["Trainer not found"] });
    }
    res.json({ message: "Trainer account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ["Internal Server Error"] });
  }
};

export const updateTrainerPassword = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ errors: ["Invalid trainer ID"] });
    }
    if (newPassword !== newPasswordConfirm) {
      return res
        .status(400)
        .json({ errors: ["Password and passwordConfirm should match"] });
    }
    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json({ errors: ["New password cannot be same as current password"] });
    }
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ errors: ["Trainer not found"] });
    }
    const isPasswordCorrect = await trainer.isPasswordCorrect(
      currentPassword,
      trainer.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ errors: ["Current password is incorrect"] });
    }
    trainer.password = newPassword;
    const validationErrors = trainer.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ errors });
    }
    await trainer.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ["Internal Server Error"] });
  }
};

export const getSessionsOfTrainer = async (req, res) => {
  try {
    const trainerId = req.params.trainerId;
    const trainer = await Trainer.findOne({
      _id: new mongoose.Types.ObjectId(trainerId),
    });
    const trainerSessions = await Session.find({
      _id: { $in: trainer.sessions },
    });
    if (trainerSessions.length === 0) {
      return res.status(404).json({ errors: ["Trainer has no sessions"] });
    }
    res.status(200).json({ trainerSessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ["Internal Server Error"] });
  }
};

async function getCurrentWeekSchedule(trainer) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(today);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const sessions = await Session.find({
    _id: { $in: trainer.sessions },
    startDate: { $lte: endOfWeek },
    endDate: { $gte: startOfWeek },
    isActive: true,
  });

  const sessionsByWeekdayAndTimeSlot = {};

  const startTime = new Date(startOfWeek);
  startTime.setHours(8, 0, 0, 0);

  const endTime = new Date(endOfWeek);
  endTime.setHours(21, 0, 0, 0);

  for (
    let currentDay = new Date(startOfWeek);
    currentDay <= endOfWeek;
    currentDay.setDate(currentDay.getDate() + 1)
  ) {
    const dayOfWeek = currentDay.toLocaleDateString("en-US", {
      weekday: "long",
    });

    let currentSlot = new Date(startTime);

    for (
      ;
      currentSlot <= endTime;
      currentSlot.setHours(currentSlot.getHours() + 1)
    ) {
      const timeSlot = currentSlot.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      });

      if (!sessionsByWeekdayAndTimeSlot[dayOfWeek]) {
        sessionsByWeekdayAndTimeSlot[dayOfWeek] = {};
      }

      if (!sessionsByWeekdayAndTimeSlot[dayOfWeek][timeSlot]) {
        sessionsByWeekdayAndTimeSlot[dayOfWeek][timeSlot] = {};

        const sessionForSlot = sessions.find((session) => {
          return session.sessionSlots.some((slot) => {
            const [startTime, endTime] = slot.timeSlot.split("-");
            const [startHours, startMinutes] = startTime.split(":");
            const formattedSessionTime = new Date();
            formattedSessionTime.setHours(
              parseInt(startHours, 10),
              parseInt(startMinutes, 10)
            );

            return (
              slot.weekday === dayOfWeek &&
              isTimeInRange(timeSlot, startTime, endTime)
            );
          });
        });

        if (sessionForSlot) {
          sessionsByWeekdayAndTimeSlot[dayOfWeek][timeSlot] = {
            id: sessionForSlot._id.toString(),
            name: sessionForSlot.name,
            place: sessionForSlot.place,
            attendees: sessionForSlot.registeredUsers.length,
          };
        } else {
          sessionsByWeekdayAndTimeSlot[dayOfWeek][timeSlot] = {
            name: "No Session",
            place: "",
          };
        }
      }
    }
  }

  return sessionsByWeekdayAndTimeSlot;
}

function isTimeInRange(time, startTime, endTime) {
  const timeToCheck = new Date(`2000-01-01T${time}`);
  const rangeStartTime = new Date(`2000-01-01T${startTime}`);
  const rangeEndTime = new Date(`2000-01-01T${endTime}`);

  return timeToCheck >= rangeStartTime && timeToCheck <= rangeEndTime;
}

export const updateTrainerProfile = async (req, res) => {
  try {
    const trainer = req.trainer;

    trainer.firstName = req.body.firstName;
    trainer.lastName = req.body.lastName;
    trainer.email = req.body.email;
    trainer.address.street = req.body.street;
    trainer.address.city = req.body.city;
    trainer.address.state = req.body.state;
    trainer.address.zip = req.body.zip;
    trainer.phone = req.body.phone;

    trainer.workoutType = req.body.workoutType;

    await trainer.save();

    res.redirect("/trainer/profile/info");
  } catch (error) {
    res.render("trainer/trainerProfile", {
      layout: "trainerHome",
      trainer: req.trainer.toObject(),
      hasErrors: true,
      errors: [
        "An error occurred while updating the profile. Please try again.",
      ],
    });
  }
};

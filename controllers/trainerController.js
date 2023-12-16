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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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

    const mealPlans = await MealPlan.find({});

    let sessionsByWeekdayAndSlot = await getCurrentWeekSchedule();
    const weekdays = Object.keys(sessionsByWeekdayAndSlot);
    const timeSlots = [
      ...new Set(
        [].concat(
          ...weekdays.map((day) => Object.keys(sessionsByWeekdayAndSlot[day]))
        )
      ),
    ];

    res.render("trainer/trainerDashboard", {
      trainer: trainer.toObject(),
      activeSessions,
      stats: {
        activeSessionsCount: activeSessions.length,
        totalRegisteredUsersCount,
        totalMealPlans: mealPlans.length,
      },
      sessionsByWeekdayAndSlot,
      weekdays,
      timeSlots,
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
    const userIds = session.registeredUsers.map((user) => user.userId);
    const users = await User.find({ _id: { $in: userIds } }).lean();
    res.render("trainer/trainerSessionUsers", {
      trainerName: trainer.trainerName,
      trainerId: trainer._id.toString(),
      sessionName: session.name,
      users,
      type: "trainer",
      layout: "trainerHome",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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

async function getCurrentWeekSchedule() {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const endOfWeek = new Date(today);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const sessions = await Session.find({
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

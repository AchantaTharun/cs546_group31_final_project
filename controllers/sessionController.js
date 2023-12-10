import Trainer from '../models/trainerModel.js';
import Session from '../models/sessionModel.js';
import mongoose from 'mongoose';

export const createSession = async (req, res) => {
  try {
    const {
      sessionName,
      sessionPlace,
      isWeekly,
      sessionCapacity,
      sessionSlots,
      workoutType,
      startDate,
      endDate,
    } = req.body;

    const trainer = req.trainer;

    const currentDate = new Date();

    if (new Date(startDate) < currentDate || new Date(endDate) < currentDate) {
      return res.status(400).json({
        errors: [
          'Start date and end date should be equal to or after the current date',
        ],
      });
    }

    const conflictingSession = await Session.findOne({
      isActive: true,
      $and: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
        {
          'sessionSlots.weekday': {
            $in: sessionSlots.map((slot) => slot.weekday),
          },
          'sessionSlots.timeSlot': {
            $in: sessionSlots.map((slot) => slot.timeSlot),
          },
        },
      ],
    });

    if (
      trainer.sessions.indexOf(conflictingSession._id) !== -1 &&
      conflictingSession
    ) {
      return res.status(400).json({
        errors: [
          'There is already an active session with conflicting time slots and weekdays',
        ],
      });
    }

    const newSession = new Session({
      name: sessionName,
      place: sessionPlace,
      isWeekly,
      capacity: sessionCapacity,
      sessionSlots,
      workoutType,
      startDate,
      endDate,
      isActive: true,
    });

    const validationErrors = newSession.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      console.log(errors);
      return res.status(400).json({ errors });
    }

    const savedSession = await newSession.save();

    trainer.sessions.push(savedSession._id);
    await trainer.save();

    res.status(201).json({ message: 'Session created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      sessionName,
      sessionPlace,
      isWeekly,
      sessionCapacity,
      sessionSlots,
      workoutType,
      startDate,
      endDate,
    } = req.body;

    const trainer = req.trainer;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ errors: ['Invalid session ID'] });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ errors: ['Session not found'] });
    }

    const currentDate = new Date();

    if (new Date(startDate) < currentDate || new Date(endDate) < currentDate) {
      return res.status(400).json({
        errors: [
          'Start date and end date should be equal to or after the current date',
        ],
      });
    }

    const conflictingSession = await Session.findOne({
      isActive: true,
      $and: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
        {
          'sessionSlots.weekday': {
            $in: sessionSlots.map((slot) => slot.weekday),
          },
          'sessionSlots.timeSlot': {
            $in: sessionSlots.map((slot) => slot.timeSlot),
          },
        },
      ],
    });

    if (
      trainer.sessions.indexOf(conflictingSession._id) !== -1 &&
      conflictingSession
    ) {
      return res.status(400).json({
        errors: [
          'There is already an active session with conflicting time slots and weekdays',
        ],
      });
    }

    session.name = sessionName;
    session.place = sessionPlace;
    session.isWeekly = isWeekly;
    session.capacity = sessionCapacity;
    session.sessionSlots = sessionSlots;
    session.workoutType = workoutType;
    session.startDate = startDate;
    session.endDate = endDate;
    session.isActive = true;

    const validationErrors = session.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      return res.status(400).json({ errors });
    }

    const updatedSession = await session.save();

    res.status(200).json({
      message: 'Session updated successfully',
      session: updatedSession,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const getSessionDetails = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const session = await Session.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
    }).lean();

    if (!session) {
      return res.status(404).json({ errors: ['Session Not Found'] });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const trainer = req.trainer;
    const activeSessions = await Session.find({
      _id: { $in: trainer.sessions },
      isActive: true,
    })
      .sort({ createWhen: 1 })
      .exec();

    res.status(200).json({ activeSessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const getInactiveSessions = async (req, res) => {
  try {
    const trainer = req.trainer;
    const inactiveSessions = await Session.find({
      _id: { $in: trainer.sessions },
      isActive: false,
    })
      .sort({ createWhen: -1 })
      .exec();

    res.status(200).json({ inactiveSessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const registerForSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ errors: ['Session not found'] });
    }

    if (!session.isActive) {
      return res
        .status(400)
        .json({ errors: ['Session is not active anymore'] });
    }

    const trainer = await Trainer.findOne({
      sessions: {
        $elemMatch: { $eq: new mongoose.Types.ObjectId(sessionId) },
      },
    });

    if (!trainer) {
      return res
        .status(404)
        .json({ errors: ['Trainer not found for the session'] });
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    if (session.registeredUsers.some((u) => u.userId.equals(userId))) {
      return res
        .status(400)
        .json({ errors: ['User already registered for this session'] });
    }

    const conflictingSessions = await Session.find({
      'registeredUsers.userId': userId,
      isActive: true,
      $and: [
        {
          startDate: { $lte: session.endDate },
          endDate: { $gte: session.startDate },
        },
        {
          'sessionSlots.weekday': {
            $in: session.sessionSlots.map((slot) => slot.weekday),
          },
          'sessionSlots.timeSlot': {
            $in: session.sessionSlots.map((slot) => slot.timeSlot),
          },
        },
      ],
    });

    if (conflictingSessions.length > 0) {
      return res.status(400).json({
        errors: [
          'User already registered for a conflicting session during the same time period.',
        ],
      });
    }

    if (session.registeredUsers.length >= session.capacity) {
      return res.status(400).json({ errors: ['Session is already full'] });
    }

    session.registeredUsers.push({ userId });
    await session.save();

    res.status(200).json({ message: 'User registered for the session' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const unregisterFromSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ errors: ['Session not found'] });
    }

    if (!session.isActive) {
      return res
        .status(400)
        .json({ errors: ['Session is not active anymore'] });
    }

    const userRegistrationIndex = session.registeredUsers.findIndex((u) =>
      u.userId.equals(user._id)
    );

    if (userRegistrationIndex === -1) {
      return res.status(400).json({
        errors: ['User is not registered for this session'],
      });
    }

    session.registeredUsers.splice(userRegistrationIndex, 1);

    await session.save();

    res.status(200).json({ message: 'User unregistered from the session' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const unregisterUserFromSessionByTrainer = async (req, res) => {
  try {
    const { sessionId, userId } = req.params;
    const trainer = req.trainer;

    if (
      trainer.sessions.indexOf(new mongoose.Types.ObjectId(sessionId)) === -1
    ) {
      return res
        .status(400)
        .json({ errors: ['You are not the owner of the session'] });
    }
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ errors: ['Session not found'] });
    }

    if (!session.isActive) {
      return res
        .status(400)
        .json({ errors: ['Session is not active anymore'] });
    }

    const userRegistrationIndex = session.registeredUsers.findIndex((u) =>
      u.userId.equals(userId)
    );

    if (userRegistrationIndex === -1) {
      return res.status(400).json({
        errors: ['User is not registered for this session'],
      });
    }

    session.registeredUsers.splice(userRegistrationIndex, 1);

    await session.save();

    res.status(200).json({ message: 'User unregistered from the session' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const toggleSessionActivation = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const trainer = req.trainer;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ errors: ['Invalid session ID'] });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ errors: ['Session not found'] });
    }

    if (
      trainer.sessions.indexOf(new mongoose.Types.ObjectId(sessionId) === -1)
    ) {
      return res
        .status(400)
        .json({ errors: ['You are not the owner of this session'] });
    }

    if (!session.isActive) {
      const currentDate = new Date();

      if (
        new Date(session.startDate) < currentDate ||
        new Date(session.endDate) < currentDate
      ) {
        return res.status(400).json({
          errors: [
            'Start date and end date should be equal to or after the current date',
          ],
        });
      }

      const conflictingSession = await Session.findOne({
        isActive: true,
        $and: [
          {
            startDate: { $lte: session.endDate },
            endDate: { $gte: session.startDate },
          },
          {
            'sessionSlots.weekday': {
              $in: session.sessionSlots.map((slot) => slot.weekday),
            },
            'sessionSlots.timeSlot': {
              $in: session.sessionSlots.map((slot) => slot.timeSlot),
            },
          },
        ],
      });

      if (conflictingSession) {
        return res.status(400).json({
          errors: [
            'There is already an active session with conflicting time slots and weekdays',
          ],
        });
      }
    }

    session.isActive = !session.isActive;

    const updatedSession = await session.save();

    res.status(200).json({
      message: `Session ${
        updatedSession.isActive ? 'activated' : 'deactivated'
      } successfully`,
      session: updatedSession,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

import Trainer from '../models/trainerModel.js';
import Session from '../models/sessionModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

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
    res.render('trainer/trainerSessions', {
      name: trainer.trainerName,
      trainerId: trainer._id.toString(),
      activeSessions,
      inactiveSessions,
      type: 'trainer',
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
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
    const inactiveSessions = await Session.find({
      _id: { $in: sessionIds },
      isActive: false,
    }).lean();
    res.render('trainer/trainerDashboard', {
      name: trainer.trainerName,
      activeSessions,
      inactiveSessions,
      type: 'trainer',
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const renderTrainerSessionUsers = async (req, res) => {
  try {
    const trainer = req.trainer;
    const sessionId = req.params.sessionId;
    const sessionIds = trainer.sessions;
    const session = await Session.findOne({ _id: sessionId }).lean();
    if (!session) {
      return res.status(404).json({ errors: ['Session not found'] });
    }
    const userIds = session.registeredUsers;
    const users = await User.find({ _id: { $in: userIds } }).lean();
    res.render('trainer/trainerSessionUsers', {
      trainerName: trainer.trainerName,
      trainerId: trainer._id.toString(),
      sessionName: session.name,
      users,
      type: 'trainer',
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({});

    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const getTrainerDetails = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.trainerId);
    if (!trainer) {
      return res.status(404).json({ errors: ['Trainer not found'] });
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
    res.status(500).json({ errors: ['Internal Server Error'] });
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
      return res.status(400).json({ errors: ['Invalid trainer ID'] });
    }
    if (password !== passwordConfirm) {
      return res
        .status(400)
        .json({ errors: ['Password and passwordConfirm should match'] });
    }
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ errors: ['Trainer not found'] });
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
      message: 'Trainer updated successfully',
      trainer: {
        _id,
        trainerName: updatedName,
        email: updatedEmail,
        status: updatedStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const deleteTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findByIdAndDelete(req.params.trainerId);
    if (!trainer) {
      return res.status(404).json({ errors: ['Trainer not found'] });
    }
    res.json({ message: 'Trainer account deleted successfully' });
  } catch (error) {
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

export const updateTrainerPassword = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    if (!mongoose.Types.ObjectId.isValid(trainerId)) {
      return res.status(400).json({ errors: ['Invalid trainer ID'] });
    }
    if (newPassword !== newPasswordConfirm) {
      return res
        .status(400)
        .json({ errors: ['Password and passwordConfirm should match'] });
    }
    if (newPassword === currentPassword) {
      return res
        .status(400)
        .json({ errors: ['New password cannot be same as current password'] });
    }
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ errors: ['Trainer not found'] });
    }
    const isPasswordCorrect = await trainer.isPasswordCorrect(
      currentPassword,
      trainer.password
    );
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ errors: ['Current password is incorrect'] });
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
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ errors: ['Internal Server Error'] });
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
      return res.status(404).json({ errors: ['Trainer has no sessions'] });
    }
    res.status(200).json(trainerSessions);
  } catch (error) {
    res.status(500).json({ errors: ['Internal Server Error'] });
  }
};

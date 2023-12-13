import mongoose from 'mongoose';

const sessionSlotSchema = new mongoose.Schema({
  weekday: {
    type: String,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
});

const sessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter the session name'],
    trim: true,
  },
  place: {
    type: String,
    required: [true, 'Please enter the session place/gym'],
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Please enter the session capacity'],
    min: [1, 'Capacity must be at least 1'],
  },
  workoutType: {
    type: String,
    required: [true, 'Please enter the type of workout or goal of the session'],
    trim: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Please enter start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please enter end date'],
  },
  sessionSlots: {
    type: [sessionSlotSchema],
    required: [true, 'Please enter session slots'],
  },
  registeredUsers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
      },
      registrationDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isActive: {
    type: Boolean,
    required: [true, 'Please enter isActive input field'],
  },
  createWhen: {
    type: Date,
    default: Date.now,
  },
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;

import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const trainerSchema = new mongoose.Schema({
  trainerName: {
    type: String,
    required: [true, 'Please enter your name'],
    trim: true,
    minLength: [3, 'Trainer Name must be at least 3 characters long'],
    maxLength: [50, 'Trainer Name must be less than 50 characters long'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    trim: true,
    validate: [validator.isEmail, 'Please enter a valid email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    trim: true,
    minLength: [8, 'Password must be at least 8 characters long'],
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please enter your street'],
      trim: true,
      minLength: [3, 'Street must be at least 3 characters long'],
      maxLength: [50, 'Street must be less than 50 characters long'],
    },
    city: {
      type: String,
      required: [true, 'Please enter your city'],
      trim: true,
      minLength: [3, 'City must be at least 3 characters long'],
      maxLength: [50, 'City must be less than 50 characters long'],
    },
    state: {
      type: String,
      required: [true, 'Please enter your state'],
      trim: true,
      length: [2, 'State must be 2 characters long'],
    },
    zip: {
      type: String,
      required: [true, 'Please enter your zip'],
      trim: true,
    },
  },
  phone: {
    type: String,
    required: [true, 'Please enter your phone number'],
    trim: true,
    validate: [validator.isMobilePhone, 'Please enter a valid phone number'],
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  isTrainer: {
    type: Boolean,
    default: true,
  },
  passwordChangedAt: {
    type: Date,
  },
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
    },
  ],
  //   businessLicense: {
  //     type: String,
  //     required: [true, "Please upload your business license"],
  //   },
});

trainerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

trainerSchema.methods.isPasswordCorrect = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// trainerSchema.path('passwordConfirm').validate(function (el) {
//   if (this.isNew) {
//     return el === this.password;
//   }
//   return true; // Skip validation for updates
// }, 'Passwords do not match');

const Trainer = mongoose.model('Trainer', trainerSchema);

export default Trainer;

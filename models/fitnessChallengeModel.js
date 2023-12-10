import mongoose from 'mongoose';

const fitnessChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const FitnessChallenge = mongoose.model(
  'FitnessChallenge',
  fitnessChallengeSchema
);

export default FitnessChallenge;

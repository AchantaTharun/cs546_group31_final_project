import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true,
  },
  meals: [
    {
      name: String,
      description: String,
    },
  ],
});

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;

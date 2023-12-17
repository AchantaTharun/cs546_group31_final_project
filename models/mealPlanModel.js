import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: [2, "Title must be at least 3 characters long"],
    maxLength: [50, "Title Name must be less than 50 characters long"],
  },
  description: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: true,
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },
  meals: [
    {
      name: String,
      description: String,
    },
  ],
});

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);

export default MealPlan;

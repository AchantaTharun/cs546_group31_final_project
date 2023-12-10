import MealPlan from '../models/mealPlanModel.js';

export const createMealPlan = async (req, res) => {
  try {
    const { title, description, assignedTo, assignedBy, meals } = req.body;

    const newMealPlan = await MealPlan.create({
      title,
      description,
      assignedTo,
      assignedBy,
      meals,
    });

    res.status(201).json(newMealPlan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const assignMealPlan = async (req, res) => {
  try {
    const { mealPlanId, userId } = req.params;

    const updatedMealPlan = await MealPlan.findByIdAndUpdate(
      mealPlanId,
      { assignedTo: userId },
      { new: true }
    );

    res.json(updatedMealPlan);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

import MealPlan from "../models/mealPlanModel.js";

export const createMealPlan = async (req, res) => {
  try {
    const { title, description, assignedTo, assignedBy, meals, session } =
      req.body;

    const newMealPlan = await MealPlan({
      title,
      description,
      assignedTo,
      assignedBy,
      session,
      meals,
    });
    const validationErrors = newMealPlan.validateSync();
    if (validationErrors) {
      const errors = Object.values(validationErrors.errors).map(
        (error) => error.message
      );
      //console.log(errors);
      return res.status(400).json({ errors });
    }
    const savedMeal = await newMealPlan.save();
    const trainer = req.trainer;
    trainer.mealPlans.push(savedMeal._id);
    await trainer.save();

    res.status(201).json(savedMeal);
  } catch (error) {
    res.status(500).json({ errors: [error.message] });
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
    res.status(500).json({ error: "Internal Server Error" });
  }
};

import FitnessChallenge from '../models/fitnessChallengeModel.js';

export const createFitnessChallenge = async (req, res) => {
  try {
    const { title, description } = req.body;
    const creator = req.user.id;

    const newChallenge = await FitnessChallenge.create({
      title,
      description,
      creator,
      participants: [creator],
    });

    res.status(201).json(newChallenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const joinFitnessChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const participant = req.user.id;

    const updatedChallenge = await FitnessChallenge.findByIdAndUpdate(
      challengeId,
      { $addToSet: { participants: participant } },
      { new: true }
    );

    res.json(updatedChallenge);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

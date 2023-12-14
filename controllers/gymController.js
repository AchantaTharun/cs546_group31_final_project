import Gym from "../models/gymModel.js";

export const getAllGyms = async (req, res) => {
	try {
		const gyms = await Gym.find();
		if (!gyms || gyms.length === 0) {
			return res.status(404).json({
				status: "fail",
				errors: ["No gyms have been made yet"],
			});
		}
		return res.status(200).json({
			status: "success",
			results: gyms.length,
			data: {
				gyms,
			},
		});
	} catch (e) {
		return res.status(500).json({
			status: "fail",
			errors: [e.message],
		});
	}
};

export const getGymById = async (req, res) => {
	console.log(req.params.id);
	try {
		const gym = await Gym.findById(req.params.id);
		if (!gym) {
			return res.status(404).json({
				status: "fail",
				errors: ["No gym found with that ID"],
			});
		}
		return res.status(200).json({
			status: "success",
			data: {
				gym,
			},
		});
	} catch (e) {
		return res.status(500).json({
			status: "fail",
			errors: [e.message],
		});
	}
};

export const updateGym = async (req, res) => {
	try {
		const gym = await Gym.findById(req.params.id);
		if (!gym) {
			return res.status(404).json({
				status: "fail",
				errors: ["No gym found with that ID"],
			});
		}
		const { email, address, phone } = req.body;
		const updatedGym = await Gym.findByIdAndUpdate(
			req.params.id,
			{ email, address, phone },
			{ new: true }
		);
		return res.status(200).json({
			status: "success",
			data: {
				post: updatedGym,
			},
		});
	} catch (e) {
		return res.status(500).json({
			status: "fail",
			errors: [e.message],
		});
	}
};

export const deleteGym = async (req, res) => {
	try {
		const gym = await Gym.findById(req.params.id);
		if (!gym) {
			return res.status(404).json({
				status: "fail",
				errors: ["No gym found with that ID"],
			});
		}
		await Gym.findByIdAndDelete(req.params.id);
		return res.status(204).json({
			status: "success",
			data: "Deleted gym!",
		});
	} catch (e) {
		return res.status(500).json({
			status: "fail",
			errors: [e.message],
		});
	}
};

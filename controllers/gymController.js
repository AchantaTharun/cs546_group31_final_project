import Gym from "../models/gymModel.js";
import User from "../models/userModel.js";

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
				gym: updatedGym,
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

export const search = async (req, res) => {
	try {
		const { selectUser, searchType, search } = req.query;
		let query = {};

		if (searchType && search) {
			if (searchType.toLowerCase() === "names") {
				console.log("inside");
				query.$or = [
					{ firstName: { $regex: `^${search}`, $options: "i" } },
					{ lastName: { $regex: `^${search}`, $options: "i" } },
				];
			} else if (searchType.toLowerCase() === "location") {
				query.location = { $regex: `^${search}`, $options: "i" };
			} else if (searchType.toLowerCase() === "email") {
				query.email = { $regex: `^${search}`, $options: "i" };
			}
		}
		const user = await User.find(query);
		if (!user) {
			return res.status(404).json({
				status: "fail",
				message: "No user found with that ID",
			});
		}
		return res.status(200).json({
			status: "success",
			data: {
				user,
			},
		});
	} catch (e) {
		return res.status(500).json({
			status: "fail",
			message: e.message,
		});
	}
};

export const addMembers = async (req, res) => {
	console.log(req.body);
};

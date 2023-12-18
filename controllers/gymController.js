import mongoose from "mongoose";
import Gym from "../models/gymModel.js";
import User from "../models/userModel.js";
import Trainer from "../models/trainerModel.js";

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
		// console.log(req.gym);
		const gymId = req.gym._id;
		const gym = await Gym.findById(gymId);
		if (!gym) {
			return res.status(404).json({
				status: "fail",
				errors: ["No gym found with that ID"],
			});
		}
		const { gymName, email, street, city, state, zip } = req.body;
		const updatedGym = await Gym.findByIdAndUpdate(
			gymId,
			{ gymName, email, street, city, state, zip },
			{ new: true }
		);
		return res.status(200).redirect("/dashboard");
		// json({
		// 	status: "success",
		// 	data: {
		// 		gym: updatedGym,
		// 	},
		// });
	} catch (e) {
		return res.status(400).redirect("/dashboard");
		// json({
		// 	status: "fail",
		// 	errors: [e.message],
		// });
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

export const renderGymMembers = async (req, res) => {
	try {
		const gym = req.gym;
		const memberIds = [
			"657d391e9a2e174fdcb287d8",
			"657d391e9a2e174fdcb287da",
			"657d391e9a2e174fdcb287dc",
		];
		const memberIdObj = memberIds.map(
			(id) => new mongoose.Types.ObjectId(id)
		);

		const trainerIds = ["657ee48fffc500627edc85ee"];
		const trainerIdObj = trainerIds.map(
			(id) => new mongoose.Types.ObjectId(id)
		);
		// console.log(gym.toObject().members[0]);
		const members = await User.find({
			_id: { $in: gym.toObject().members },
		}).lean();

		console.log(members);
		const trainers = await Trainer.find({
			_id: { $in: trainerIdObj },
		}).lean();

		// console.log(trainers);
		res.render("gym/gymDashboard", {
			members,
			trainers,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const renderDashboard = async (req, res) => {
	try {
		const gym = req.gym;
		if (gym.status !== "approved") {
			return res.render("gym/gymDashboard", {
				layout: "gymHome.layout.handlebars",
				hasErr: false,
				// users,
				message: "Please wait for admin approval",
			});
		}
		const { searchType, search } = req.body;
		let user = undefined;
		if (searchType === "phone") {
			user = await User.findOne({ phone: search.trim() }).lean();
		} else {
			user = await User.findOne({ email: search.trim() }).lean();
		}

		if (!user) {
			return res.render("gym/gymDashboard", {
				layout: "gymHome.layout.handlebars",
				hasErr: true,
				error: "No user found!",
			});
		}
		req.gym.members.push(user._id);
		req.gym.save();
		const users = await User.find({ _id: { $in: req.gym.members } }).lean();
		return res.render("gym/gymDashboard", {
			layout: "gymHome.layout.handlebars",
			hasErr: false,
			users,
		});
	} catch (err) {
		return res.render("gym/gymDashboard", {
			layout: "gymHome.layout.handlebars",
			hasErr: true,
			error: err.message,
		});
	}
};

export const getRenderDashboard = async (req, res) => {
	try {
		// let user = undefined;
		// if (searchType === "phone") {
		// 	user = await User.findOne({ phone: search.trim() }).lean();
		// } else {
		// 	user = await User.findOne({ email: search.trim() }).lean();
		// }

		// if (!user) {
		// 	return res.render("gym/gymDashboard", {
		// 		layout: "gymHome.layout.handlebars",
		// 		hasErr: true,
		// 		error: "No user found!",
		// 	});
		// }
		// req.gym.members.push(user._id).save();
		const users = await User.find({ _id: { $in: req.gym.members } }).lean();
		return res.render("gym/gymDashboard", {
			layout: "gymHome.layout.handlebars",
			hasErr: false,
			users,
		});
	} catch (err) {
		return res.render("gym/gymDashboard", {
			layout: "gymHome.layout.handlebars",
			hasErr: true,
			error: err.message,
		});
	}
};

// export const search = async (req, res) => {
// 	try {
// 		const { searchType, search } = req.query;
// 		// console.log(req.query);
// 		let memberQuery = {};

// 		if (searchType && search) {
// 			if (searchType.toLowerCase() === "names") {
// 				memberQuery["name"] = {
// 					$regex: `^${search}`,
// 					$options: "i",
// 				};
// 			} else if (searchType.toLowerCase() === "email") {
// 				memberQuery["email"] = {
// 					$regex: `^${search}`,
// 					$options: "i",
// 				};
// 			}
// 		}
// 		// console.log(memberQuery);

// 		const gyms = await Gym.find({ members: { $elemMatch: memberQuery } });
// 		const matchingMembers = [];

// 		gyms.forEach((gym) => {
// 			gym.members.forEach((member) => {
// 				if (
// 					(searchType.toLowerCase() === "names" &&
// 						new RegExp(`^${search}`, "i").test(member.name)) ||
// 					(searchType.toLowerCase() === "email" &&
// 						new RegExp(`^${search}`, "i").test(member.email))
// 				) {
// 					matchingMembers.push(member);
// 				}
// 			});
// 		});

// 		if (matchingMembers.length === 0) {
// 			return res.status(404).json({
// 				status: "fail",
// 				message: "No members found with the given criteria",
// 			});
// 		}

// 		return res.status(200).json({
// 			status: "success",
// 			data: {
// 				members: matchingMembers,
// 			},
// 		});
// 	} catch (e) {
// 		return res.status(500).json({
// 			status: "fail",
// 			message: e.message,
// 		});
// 	}
// };

// export const getSome = async (type,name) => {
//     if(!type || !name ) throw "Certain input parameters are missing";
//     if(typeof type!=='string') throw "Collection type must be in string format";
//     type=type.trim();
//     if(type!=='user' && type!=='trainer' && type!=='gym' && type!=='event' && type!=='post') throw "Invalid Collection type was passed";
//     name = help.checkString(name);

//     name = new RegExp(name,'gi');

//     let object = undefined;
//       object = await User.find({lastName:name}).select('-password').exec();

//     if(!object) throw `Not one ${type} found with that description`;
//     return object;
//   };

// export const addMembers = async (req, res) => {
// 	try {
// 		const gymId = req.gym._id;
// 		const memberId = new mongoose.Types.ObjectId();
// 		const { name, email } = req.body;

// 		const gym = await Gym.findById(gymId);
// 		if (!gym) {
// 			return res.status(404).send("Gym not found");
// 		}

// 		gym.members.push({ _id: memberId, name, email });
// 		// console.log(gym);
// 		gym.passwordConfirm = gym.password;
// 		const validationErrors = gym.validateSync();
// 		if (validationErrors) {
// 			const errors = Object.values(validationErrors.errors).map(
// 				(error) => error.message
// 			);
// 			// return res.status(400).json({ status: "fail", errors });
// 			throw errors;
// 		}

// 		await gym.save();

// 		// Send a response
// 		res.status(200).json({
// 			status: "success",
// 			message: "Member added successfully",
// 			data: {
// 				gym,
// 			},
// 		});
// 	} catch (error) {
// 		// Error handling
// 		// console.error("Error occurred:", error.message);
// 		// console.error("Stack Trace:", error.stack);
// 		// res.status(500).json({
// 		// 	status: "error",
// 		// 	message: "Internal Server Error",
// 		// 	error: error.message, // It's often a good practice to not expose detailed error info to clients
// 		// });
// 		console.dir(error, { depth: null });
// 	}
// };

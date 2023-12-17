import { Router } from "express";

import * as authController from "../../controllers/authController.js";
import axios from "axios";
const router = Router();

router.get("/signup", async (req, res) => {
	return res.render("gymSignUp"), { layout: "main" };
});

router.post("/signup", authController.gymSignup);
router.get("/login", async (req, res) => {
	return res.render("gym/gymLogin", { layout: "main" });
});

router.post("/login", authController.gymLogin);

router.get("/dashboard", authController.protectRoute, async (req, res) => {
	res.render("gym/gymDashboard", {
		layout: "userHome.layout.handlebars",
	});
});

router.get(
	"/dashboard/search",
	authController.protectRoute,
	async (req, res) => {
		const gym = req.gym;
		try {
			const { selectUser, searchType, search } = req.query;

			let users;

			if (selectUser && searchType && search) {
				const response = await axios.get(
					"http://localhost:3000/api/v1/gym/search",
					{
						params: {
							selectUser,
							searchType,
							search,
						},
					}
				);

				users = response.data.data.user;
				console.log(users);
			}
		} catch (e) {
			console.log(e.message);
		}
	}
);

router.post("/addMembers", async (req, res) => {
	const { name, email } = req.body;
	// console.log(name, email);
	try {
		const response = await axios.post(
			"http://localhost:3000/api/v1/gym/addMembers",
			{
				name: name,
				email: email,
			},
			{
				withCredentials: true,
			}
		);

		// console.log(response.data);
	} catch (e) {
		console.log(e.message);
	}
});

export default router;

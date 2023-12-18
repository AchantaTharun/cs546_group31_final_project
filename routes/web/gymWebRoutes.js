import { Router } from "express";

import * as authController from "../../controllers/authController.js";
import axios from "axios";
import * as gymController from "../../controllers/gymController.js";
const router = Router();

router.get("/login", async (req, res) => {
	return res.render("gym/gymLogin", { layout: "main" });
});
router.post("/login", authController.gymLogin);

router.get("/signup", async (req, res) => {
	return res.render("gymSignUp"), { layout: "main" };
});
router.post("/signup", authController.gymSignup);

router.get(
	"/dashboard",
	authController.protectRoute,
	gymController.getRenderDashboard
);

router.post(
	"/dashboard",
	authController.protectRoute,
	gymController.renderDashboard
);

router.get("/profile", authController.protectRoute, async (req, res) => {
	const gym = req.gym;

	return res.render("gym/gymProfile", {
		layout: "gymProfile.layout.handlebars",
		gym,
	});
});

router.get("/profile/edit", authController.protectRoute, async (req, res) => {
	const gym = req.gym;
	res.render("gym/gymEditProfile", {
		layout: "gymEditProfile.layout.handlebars",
		gym: gym,
	});
});

router.post(
	"/profile/edit",
	authController.protectRoute,
	gymController.updateGym
);

router.get(
	"/dashboard/search",
	authController.protectRoute,
	async (req, res) => {
		try {
			const { searchType, search } = req.query;
			if (searchType && search) {
				const response = await axios.get(
					"http://localhost:3000/api/v1/gym/search",
					{
						params: {
							searchType,
							search,
						},
						headers: req.headers,
					}
				);
			}
		} catch (e) {
			console.log(e.message);
		}
	}
);

router.post("/addMembers", authController.protectRoute, async (req, res) => {
	const { name, email } = req.body;
	// console.log(name, email);
	try {
		const response = await axios.post(
			"http://localhost:3000/api/v1/gym/addMembers",
			req.body,
			{ headers: req.headers }
		);

		// console.log(response.data);
	} catch (e) {
		console.log(e.message);
	}
});

router.post("/logout", async (req, res) => {
	if (req.cookies.jwt) {
		res.clearCookie("jwt");
	}
	return res.render("gym/gymLogin");
});

export default router;

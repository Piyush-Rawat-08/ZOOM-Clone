import Router from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import { add_to_activity, get_all_activity } from "../controllers/meetingController.js";

const router = Router();
router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/add_to_activity").post(add_to_activity);
router.route("/get_all_activity").get(get_all_activity);
//router.route("/update_activity_end").put(update_activity_end);
export default router;
import Router from "express";
import { loginUser, registerUser } from "../controllers/userController.js";
import { add_to_activity, get_all_activity, get_meeting_info, delete_activity } from "../controllers/meetingController.js";

const router = Router();
router.route("/login").post(loginUser);
router.route("/register").post(registerUser);
router.route("/add_to_activity").post(add_to_activity);
router.route("/get_all_activity").get(get_all_activity);
router.route("/get_meeting_info/:meetingId").get(get_meeting_info);
router.route("/delete_activity").delete(delete_activity);
export default router;
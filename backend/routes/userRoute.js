import express from "express";
import { getCurrentUser, updateAssistant, askToAssistant, getHistory, clearHistory } from "../controllers/userController.js";
import { isAuth } from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";
const userRoute = express.Router();

userRoute.get("/current", isAuth, getCurrentUser);
userRoute.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);
userRoute.post("/asktoassistant", isAuth, askToAssistant);
userRoute.get("/history", isAuth, getHistory);
userRoute.delete("/history", isAuth, clearHistory);

export default userRoute;
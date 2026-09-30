import express from "express";
import { signUp, login, logout } from "../controllers/authController.js";

const authRoute=express.Router();

authRoute.post("/signup", signUp);
authRoute.post("/signin", login);
authRoute.post("/logout", logout);

export default authRoute;
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import authRoute from "./routes/authRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRoute from "./routes/userRoute.js";

const app=express();
app.use(cors({
  origin: process.env.FRONTEND_URL||"http://localhost:5173",
  credentials:true
}));
const port=process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRoute);
app.use("/api/user",userRoute);


app.listen(port,()=>{
  connectDB();
    console.log(`Server is running on port ${port}`);
});

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import genToken from "../config/token.js";

const signUp=async (req, res) => {
  try{
    const { name, email, password } = req.body;

    if(!name || !email || !password){
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if(existingUser){
      return res.status(400).json({ message: "User already exists" });
    }

    if(password.length < 6){
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      assistantName: user.assistantName || "",
      assistantImage: user.assistantImage || "",
      history: user.history || []
    };

    res.status(201).json(safeUser);
  }catch(error){
    console.error("Signup error:", error);
    res.status(500).json({ message: "Signup error: " + error.message });
  }
}

const login=async (req, res) => {
  try{
    const { email, password } = req.body;

    if(!email || !password){
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if(!existingUser){
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if(!isPasswordCorrect){
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    const user = existingUser;
    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      assistantName: user.assistantName || "",
      assistantImage: user.assistantImage || "",
      history: user.history || []
    };

    res.status(200).json(safeUser);
  }catch(error){
    console.error("Login error:", error);
    res.status(500).json({ message: "Login error: " + error.message });
  }
}

const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ message: "User logged out successfully" });
};

export { signUp, login, logout };
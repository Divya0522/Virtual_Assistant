import User from "../models/User.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Unable to get the user" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    const updateFields = {};

    if (assistantName) {
      updateFields.assistantName = assistantName.trim();
    }

    if (req.file) {
      updateFields.assistantImage = await uploadOnCloudinary(req.file.path);
    } else if (imageUrl && imageUrl.trim()) {
      updateFields.assistantImage = imageUrl.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateFields,
      { new: true }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    const status = error.http_code === 403 ? 502 : 500;
    const message = error.http_code === 403
      ? "Cloudinary rejected the upload. Check credentials."
      : "Unable to update assistant";
    return res.status(status).json({ message, error: error.message });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || !command.trim()) {
      return res.status(400).json({ message: "Command is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userName = user.name || "User";
    const assistantName = user.assistantName || "Assistant";
    const recentHistory = (user.history || []).slice(-5);

    const result = await geminiResponse(command, assistantName, userName, recentHistory);
    if (!result) {
      return res.status(502).json({ message: "Assistant service is currently unavailable." });
    }

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    let parsed = {
      type: "general",
      userInput: command,
      response: result,
      lang: "en-US"
    };

    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseErr) {
        // Fallback to text
      }
    }

    const type = parsed.type || "general";
    const userInput = parsed.userInput || command;
    let finalResponse = parsed.response || "Done";
    const lang = parsed.lang || "en-US";

    const isTelugu = lang === "te-IN" || /[\u0C00-\u0C7F]/.test(command);
    const isHindi = lang === "hi-IN" || /[\u0900-\u097F]/.test(command);

    // Ensure real-time answers for date, time, and day
    switch (type) {
      case "get-date":
      case "get_date":
        if (isTelugu) {
          finalResponse = `ఈరోజు తేదీ ${moment().format("DD MMMM, YYYY")}.`;
        } else if (isHindi) {
          finalResponse = `आज की तारीख ${moment().format("DD MMMM, YYYY")} है।`;
        } else {
          finalResponse = `Today's date is ${moment().format("dddd, MMMM D, YYYY")}.`;
        }
        break;

      case "get-time":
      case "get_time":
        if (isTelugu) {
          finalResponse = `ప్రస్తుతం సమయం ${moment().format("h:mm A")}.`;
        } else if (isHindi) {
          finalResponse = `वर्तमान समय ${moment().format("h:mm A")} है।`;
        } else {
          finalResponse = `The current time is ${moment().format("h:mm A")}.`;
        }
        break;

      case "get-day":
      case "get_day":
        if (isTelugu) {
          finalResponse = `ఈరోజు ${moment().format("dddd")}.`;
        } else if (isHindi) {
          finalResponse = `आज ${moment().format("dddd")} है।`;
        } else {
          finalResponse = `Today is ${moment().format("dddd")}.`;
        }
        break;

      case "get-month":
      case "get_month":
        finalResponse = `The current month is ${moment().format("MMMM YYYY")}.`;
        break;

      default:
        // If user query specifically mentions today's date and model gave placeholder
        if (/date|today's date|today date/i.test(command) && (/fetching|please ask|check it/i.test(finalResponse) || !finalResponse)) {
          finalResponse = `Today's date is ${moment().format("dddd, MMMM D, YYYY")}.`;
        }
        break;
    }

    // Persist to user's conversation history
    if (!Array.isArray(user.history)) {
      user.history = [];
    }

    user.history.push({
      command: command.trim(),
      response: finalResponse,
      actionType: type,
      createdAt: new Date()
    });

    // Retain up to 100 history items
    if (user.history.length > 100) {
      user.history = user.history.slice(-100);
    }

    await user.save();

    return res.status(200).json({
      type,
      userInput,
      response: finalResponse,
      lang
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to process assistant request" });
  }
};

export const getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("history");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const historyList = (user.history || []).slice().reverse();
    return res.status(200).json(historyList);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve history" });
  }
};

export const clearHistory = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { history: [] });
    return res.status(200).json({ message: "History cleared successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to clear history" });
  }
};
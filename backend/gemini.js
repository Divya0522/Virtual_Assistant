import axios from "axios";
import moment from "moment";

const geminiResponse = async (command, assistantName, username, recentHistory = []) => {
  const now = moment();
  const currentDateStr = now.format("dddd, MMMM D, YYYY");
  const currentTimeStr = now.format("h:mm A");

  const historyContext = recentHistory.length > 0
    ? recentHistory.map(h => `User: "${h.command}"\nAssistant: "${h.response}"`).join("\n")
    : "No prior conversation.";

  const prompt = `You are a world-class, personalized virtual AI assistant named "${assistantName}" built for "${username}".
You speak and interact with natural human intelligence, warmth, elegance, and precision (similar to an elite blend of ChatGPT, Siri, and JARVIS).

Current Real-Time Context:
- Today's Date: ${currentDateStr}
- Current Time: ${currentTimeStr}

Recent Conversation History:
${historyContext}

User Query: "${command}"

CRITICAL INSTRUCTIONS:
1. Direct, High-Quality Answers:
   - For general knowledge, science, coding, advice, or casual conversation: Provide a smart, articulate, engaging, and accurate answer (2-4 clear sentences, perfect for both reading and speaking).
   - Never give vague, lazy, or robotic responses like "Done", "I can help with that", or "Please ask me".
   - If the user asks "do you know today date" or "what is today's date": IMMEDIATELY state the date ("Today is ${currentDateStr}.").
   - If the user asks for time: State the current time ("The time is ${currentTimeStr}.").
   - If the user asks about previous topics using pronouns ("that", "it", "there", "him/her"): Use the Recent Conversation History to provide the exact context.

2. Application Actions (Map accurately to "type" and clean "userInput"):
   - "open mail" / "check email" -> type: "mail_open", userInput: "mail", response: "Opening your Gmail inbox for you."
   - "open youtube channel [Name]" or "open [Name] channel" -> type: "youtube_channel_open", userInput: "[Clean Channel Name]", response: "Opening the [Name] channel on YouTube."
   - "play [song/video]" or "search youtube for [query]" -> type: "youtube_play", userInput: "[search query]", response: "Playing [query] on YouTube for you."
   - "open youtube" -> type: "youtube_play", userInput: "", response: "Opening YouTube for you."
   - "open linkedin" -> type: "linkedin_open", userInput: "", response: "Opening LinkedIn for you."
   - "search [person/topic] on linkedin" -> type: "linkedin_search", userInput: "[search query]", response: "Searching LinkedIn for [search query]."
   - "open google and search [query]" -> type: "google_search", userInput: "[clean search query]", response: "Searching Google for [search query]."
   - "open calculator" -> type: "calculator_open", userInput: "", response: "Opening calculator for you."
   - "open whatsapp" -> type: "whatsapp_open", userInput: "", response: "Opening WhatsApp for you."
   - "open github" -> type: "github_open", userInput: "", response: "Opening GitHub for you."
   - "open instagram" -> type: "instagram_open", userInput: "", response: "Opening Instagram for you."
   - "open spotify" / "play on spotify" -> type: "spotify_open", userInput: "[query]", response: "Opening Spotify for you."
   - "weather in [city]" -> type: "weather_check", userInput: "[city]", response: "Checking current weather for [city]."

3. Multilingual Support:
   - If the query is in Telugu (తెలుగు) or asks in Telugu: Respond in natural, polite Telugu with lang: "te-IN".
   - If the query is in Hindi (हिंदी) or asks in Hindi: Respond in natural, polite Hindi with lang: "hi-IN".
   - Otherwise respond in natural English with lang: "en-US".

4. Output Format:
   Return ONLY a strict, valid JSON object without markdown fences, code blocks, or preamble:
{
  "type": "<action_type>",
  "userInput": "<clean query or parameter>",
  "response": "<articulate, natural response text>",
  "lang": "<en-US | te-IN | hi-IN>"
}`;

  const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6JA0SbnPuNGR6Z2ovoVqlVsj_bi7cjLeiUbZXTFgQ374g";
  const candidateModels = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite"
  ];

  for (const model of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }]
        },
        { timeout: 8000 }
      );

      const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
      }
    } catch (err) {
      // Fallback to next model
    }
  }

  // Graceful multilingual fallback
  const isTelugu = /[\u0C00-\u0C7F]/.test(command);
  const isHindi = /[\u0900-\u097F]/.test(command);

  let fallbackResponse = "I'm having trouble connecting right now, but I'm here to help.";
  let lang = "en-US";
  if (isTelugu) {
    fallbackResponse = "ప్రస్తుతం కనెక్ట్ చేయడంలో సమస్య ఉంది, దయచేసి మళ్లీ ప్రయత్నించండి.";
    lang = "te-IN";
  } else if (isHindi) {
    fallbackResponse = "कनेक्ट करने में समस्या आ रही है, कृपया पुनः प्रयास करें।";
    lang = "hi-IN";
  }

  return JSON.stringify({
    type: "general",
    userInput: command,
    response: fallbackResponse,
    lang
  });
};

export default geminiResponse;
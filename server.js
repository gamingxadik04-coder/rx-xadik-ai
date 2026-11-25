
require("dotenv").config();

const express = require("express");
const { GoogleGenAI } = require("@google/genai");

 const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));

// Serve frontend files
app.use(express.static(__dirname));
if (!process.env.GEMINI_API_KEY) {
  console.error("ERROR: GEMINI_API_KEY missing in .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Backend health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    name: "RX XADIK AI",
    ai: "Gemini connected"
  });
});

// AI Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a valid message."
      });
    }

    if (message.length > 10000) {
      return res.status(413).json({
        error: "Message is too long."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: message
    });

    res.json({
      success: true,
      reply: response.text
    });

  } catch (error) {
    console.error("Gemini API Error:", error.message);

    res.status(500).json({
      success: false,
      error: "AI response failed. Please try again."
    });
  }
});

// Start server
 app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from "express";
import chatbotService from "../services/chatbotService.js";

const router = express.Router();

// POST /api/chatbot
router.post("/", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    // Validate input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    // Generate or use provided sessionId
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Get userId from session or use default
    const userId = req.user?.id || "guest_user";
    
    const response = await chatbotService.processChatbotRequest(userId, message, currentSessionId);
    
    // Include sessionId in response for frontend
    response.sessionId = currentSessionId;
    
    res.json(response);
  } catch (error) {
    console.error("Chatbot route error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;

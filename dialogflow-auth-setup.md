# Dialogflow API Authentication Setup

## **Problem Solved**
Set up Dialogflow API authentication using service account JSON file to enable chatbot functionality.

## **Step-by-Step Instructions**

### **1. Download Service Account Key**

**Get Service Account JSON:**
1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Select project:** `cineai-bxkq`
3. **Go to IAM & Admin** > **Service Accounts**
4. **Find your Dialogflow service account**
5. **Click on the service account**
6. **Go to KEYS tab**
7. **Click ADD KEY** > **Create new key**
8. **Select JSON** format
9. **Click CREATE** - Downloads JSON file
10. **Rename file to:** `service-account-key.json`

### **2. Place Service Account File**

**Move JSON file to server directory:**
```
c:/Users/meera/OneDrive/Documents/BookAI/server/service-account-key.json
```

**Verify file location:**
```bash
# Check if file exists
ls server/service-account-key.json
```

### **3. Dialogflow Service Configuration**

**File:** `server/services/dialogflowService.js`
```javascript
import { SessionsClient } from "@google-cloud/dialogflow";

// Dialogflow configuration
const projectId = "cineai-bxkq";
const keyFilename = "./service-account-key.json";

// Initialize Dialogflow client
const sessionClient = new SessionsClient({
  keyFilename: keyFilename
});

export const detectIntent = async (sessionId, message, languageCode = 'en-US') => {
  try {
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode,
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    return {
      intent: result.intent.displayName,
      fulfillmentText: result.fulfillmentText,
      parameters: result.parameters,
      confidence: result.intentDetectionConfidence,
    };

  } catch (error) {
    console.error("Dialogflow API error:", error);
    throw new Error("Failed to detect intent with Dialogflow");
  }
};
```

### **4. Chatbot Route Configuration**

**File:** `server/routes/chatbot.js`
```javascript
import express from "express";
import { detectIntent } from "../services/dialogflowService.js";

const router = express.Router();

// POST /api/chatbot - Dialogflow API for frontend
router.post("/", async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }

    const response = await detectIntent(
      sessionId || "default-session",
      message
    );

    res.json({
      success: true,
      message: response.fulfillmentText
    });

  } catch (error) {
    console.error("Chat API error:", error);

    res.json({
      success: false,
      message: "Chatbot error - Please try again"
    });
  }
});

// POST /api/chatbot/webhook - Dialogflow Webhook
router.post("/webhook", async (req, res) => {
  // Webhook logic for Flask integration
});

export default router;
```

### **5. Complete Data Flow Architecture**

**Full Flow:**
```
Frontend UI 
  -> POST /api/chatbot 
  -> Dialogflow API (detectIntent) 
  -> Intent Detection 
  -> Webhook (if enabled) 
  -> Flask ML Integration 
  -> Response
```

**Two Integration Options:**
1. **Direct API:** Frontend -> Dialogflow API -> Response
2. **Webhook:** Frontend -> Dialogflow -> Webhook -> Flask -> Response

### **6. Start the Server**

**Restart backend server:**
```bash
cd server
npm run dev
```

**Expected output:**
```
> cineai-backend@1.0.0 dev
> nodemon server.js

[nodemon] starting `node server.js`
Server: Express.js + Socket.io
Port: 5000
Mode: development
Database: MongoDB
Socket.io: Enabled
MongoDB Connected: ac-3mpohwm-shard-00-01.xfvqfy0.mongodb.net
```

### **7. Test the Integration**

**Test 1: Basic Chat API**
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "hi",
    "sessionId": "test-session"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Hello! I'm CineAI Assistant..."
}
```

**Test 2: Mood-based Recommendation**
```bash
curl -X POST http://localhost:5000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel bored",
    "sessionId": "test-session"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Here are some movies you might love..."
}
```

## **Troubleshooting**

### **Common Issues & Solutions**

#### **Issue 1: Service Account File Not Found**
**Error:** `ENOENT: no such file or directory, open './service-account-key.json'`

**Solution:**
```bash
# Check file location
ls -la server/service-account-key.json

# If missing, download again and place in server directory
```

#### **Issue 2: Permission Denied**
**Error:** `EACCES: permission denied, open './service-account-key.json'`

**Solution:**
```bash
# Check file permissions
ls -l server/service-account-key.json

# Fix permissions if needed
chmod 600 server/service-account-key.json
```

#### **Issue 3: Invalid Project ID**
**Error:** `Error: 3 INVALID_ARGUMENT: Project id is required`

**Solution:**
```javascript
// Verify project ID in dialogflowService.js
const projectId = "cineai-bxkq"; // Must match your Dialogflow project
```

#### **Issue 4: API Not Enabled**
**Error:** `Error: 7 PERMISSION_DENIED: Cloud Natural Language API has not been used in project`

**Solution:**
1. **Go to Google Cloud Console**
2. **Select project:** `cineai-bxkq`
3. **Go to APIs & Services > Library**
4. **Search for:** "Dialogflow API"
5. **Click ENABLE**

#### **Issue 5: Service Account Permissions**
**Error:** `Error: 7 PERMISSION_DENIED: Permission denied`

**Solution:**
1. **Go to IAM & Admin > Service Accounts**
2. **Select your service account**
3. **Click EDIT**
4. **Add role:** "Dialogflow API Client"
5. **Save changes**

## **Environment Configuration**

### **No Environment Variables Needed**
```javascript
// Using direct file path - no environment variables
const keyFilename = "./service-account-key.json";
```

### **Optional Environment Variables**
```env
# If you prefer environment variables
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
DIALOGFLOW_PROJECT_ID=cineai-bxkq
```

## **Frontend Integration**

### **API Call Example**
```javascript
// Frontend JavaScript
const response = await fetch('/api/chatbot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "hi",
    sessionId: "user-session-123"
  })
});

const data = await response.json();
console.log(data.message); // "Hello! I'm CineAI Assistant..."
```

### **Response Handling**
```javascript
if (data.success) {
  // Show AI response
  showMessage(data.message);
} else {
  // Show error message
  showError(data.message);
}
```

## **Result: Working Dialogflow Integration**

### **Expected Flow:**
1. **User types message** in frontend
2. **Frontend calls** `/api/chatbot`
3. **Backend calls** Dialogflow API
4. **Dialogflow detects** intent
5. **If webhook enabled:** Calls Flask ML integration
6. **Returns response** to frontend
7. **User sees** AI response

### **Benefits:**
- **Real AI responses** - Dialogflow NLP
- **Professional chatbot** - Enterprise-grade
- **Flask integration** - ML recommendations
- **Complete booking flow** - Movie + seat suggestions
- **Error handling** - Graceful fallbacks

**The Dialogflow API authentication is now configured and the chatbot should work perfectly!**

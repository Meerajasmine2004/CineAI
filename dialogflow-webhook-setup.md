# Dialogflow Webhook Setup Guide

## **Problem Solved**
Fix Dialogflow webhook connection by making it publicly accessible via ngrok.

## **Step-by-Step Instructions**

### **1. Install ngrok ✅**
```bash
npm install -g ngrok
```

### **2. Create ngrok Account (Required)**
1. **Go to:** https://dashboard.ngrok.com/signup
2. **Sign up** for free account
3. **Verify email** address
4. **Get your authtoken** from: https://dashboard.ngrok.com/get-started/your-authtoken

### **3. Authenticate ngrok**
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### **4. Start Backend Server**
```bash
cd server
npm run dev
```
**Expected output:**
```
🎬 CineAI Backend Server Running 🎬
================================
Server: Express.js + Socket.io
Port: 5000
Mode: development
Database: MongoDB
Socket.io: Enabled
================================
```

### **5. Start ngrok Tunnel**
```bash
ngrok http 5000
```
**Expected output:**
```
ngrok by @inconshreveable                                                                

Session Status                online                                                                      
Account                       Your Name (Plan: Free)                                                           
Version                       5.0.0-beta.2                                                                    
Region                        United States (us-cal-1)                                                           
Web Interface                 http://127.0.0.1:4040                                                            
Forwarding                    https://abcd1234.ngrok-free.app -> http://localhost:5000                          

Connections                   ttl     opn     rt1     rt5     p50     p90                                 
                              0       0       0.00    0.00    0.00    0.00
```

### **6. Copy ngrok URL**
From the ngrok output, copy the HTTPS URL:
```
https://abcd1234.ngrok-free.app
```

### **7. Update Dialogflow Webhook URL**

1. **Go to Dialogflow Console:** https://dialogflow.cloud.google.com/
2. **Select your agent:** "CineAI Assistant"
3. **Go to Fulfillment** (left menu)
4. **Enable Webhook** (toggle on)
5. **Update Webhook URL:**
   ```
   OLD: http://localhost:5000/api/chatbot/webhook
   NEW: https://abcd1234.ngrok-free.app/api/chatbot/webhook
   ```
6. **Save** the settings

### **8. Test the Webhook**

**Test 1: Basic Greeting**
```
User: "hi"
Expected: "Hello! I'm CineAI Assistant..."
```

**Test 2: Mood-based Recommendation**
```
User: "I feel bored"
Expected: "Here are some movies you might love 🎬..."
```

**Test 3: Complete Booking**
```
User: "Book 2 tickets"
Expected: "🎬 *Recommended Booking*..."
```

## **Troubleshooting**

### **Common Issues & Solutions**

#### **Issue 1: ngrok authentication failed**
**Solution:**
```bash
# Create account at https://dashboard.ngrok.com/signup
# Get authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

#### **Issue 2: Backend not running**
**Solution:**
```bash
cd server
npm run dev
# Ensure you see "Server: Express.js + Socket.io" message
```

#### **Issue 3: Webhook returns 404**
**Solution:**
- **Check route exists:** `POST /api/chatbot/webhook`
- **Verify URL format:** `https://your-ngrok-url.ngrok-free.app/api/chatbot/webhook`
- **Check server logs:** Look for "Dialogflow Intent:" messages

#### **Issue 4: CORS errors**
**Solution:**
- **Ensure ngrok URL uses HTTPS** (not HTTP)
- **Check Dialogflow settings:** Webhook URL must be HTTPS
- **Verify server CORS:** Should allow ngrok domain

#### **Issue 5: Flask ML service not responding**
**Solution:**
```bash
cd ml-service
py app.py
# Ensure you see "Starting CineAI ML Service on port 5001"
```

### **Debugging Steps**

1. **Check ngrok tunnel:**
   ```bash
   curl https://your-ngrok-url.ngrok-free.app/api/chatbot/webhook
   ```

2. **Check Dialogflow logs:**
   - Go to Dialogflow Console
   - Click on your agent
   - Go to "History" tab
   - Look for webhook call logs

3. **Check server logs:**
   - Look for "Dialogflow Intent:" messages
   - Check for any error messages

## **Expected Flow**

### **Working Setup:**
```
User Message → Dialogflow → Webhook (ngrok) → Backend → Flask APIs → Response
```

### **URL Structure:**
```
Development: https://abcd1234.ngrok-free.app/api/chatbot/webhook
Production:  https://your-domain.com/api/chatbot/webhook
```

## **Important Notes**

### **ngrok Limitations:**
- **Free tier:** URL changes every restart
- **Rate limits:** 40 connections/minute
- **Session timeout:** 8 hours maximum

### **Production Setup:**
- **Use real domain:** `https://your-domain.com/api/chatbot/webhook`
- **SSL certificate:** Required for production
- **Static IP:** Recommended for reliability

### **Security Considerations:**
- **HTTPS required:** Dialogflow only accepts HTTPS webhooks
- **Firewall rules:** Allow inbound traffic on port 5000
- **Authentication:** Consider adding webhook validation

## **Quick Setup Commands**

```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Authenticate ngrok (replace YOUR_TOKEN)
ngrok config add-authtoken YOUR_AUTH_TOKEN

# 3. Start backend (Terminal 1)
cd server
npm run dev

# 4. Start ngrok (Terminal 2)
ngrok http 5000

# 5. Copy URL from ngrok output
# 6. Update Dialogflow webhook URL
# 7. Test with "hi" message
```

## **Result: Working Dialogflow Integration**

After completing these steps:
- ✅ **Dialogflow can reach** your backend webhook
- ✅ **No connection errors** in chatbot
- ✅ **Real-time responses** from Flask ML
- ✅ **Complete booking flow** working
- ✅ **Professional chatbot** experience

**The webhook will be publicly accessible and Dialogflow will successfully call your backend!**

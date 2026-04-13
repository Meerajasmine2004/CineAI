# Dialogflow Integration Setup Guide

## **Overview**
Replace custom NLP with Google Dialogflow for professional intent detection and natural language understanding.

## **1. Dialogflow Agent Setup**

### **Create Dialogflow ES Agent**

1. **Go to Dialogflow Console**: https://dialogflow.cloud.google.com/
2. **Sign in** with your Google account
3. **Create Agent**:
   - Agent Name: "CineAI Assistant"
   - Default Language: English
   - Time Zone: Your timezone
   - Project ID: Create new or use existing
4. **Click "Create"**

### **Configure Intents**

#### **1. Greeting Intent**
- **Intent Name**: Greeting
- **Training Phrases**:
  - "Hi"
  - "Hello"
  - "Hey"
  - "Good morning"
  - "Hi there"
- **Response**: "Hello! I'm CineAI Assistant. How can I help you today?"

#### **2. ShowMovies Intent**
- **Intent Name**: ShowMovies
- **Training Phrases**:
  - "Show me movies"
  - "What movies are playing"
  - "List all movies"
  - "What's on"
  - "Current movies"
- **Response**: Enable webhook call

#### **3. BookTickets Intent**
- **Intent Name**: BookTickets
- **Training Phrases**:
  - "Book tickets"
  - "I want to book"
  - "Buy movie tickets"
  - "Reserve seats"
- **Response**: Enable webhook call

#### **4. SeatRecommendation Intent**
- **Intent Name**: SeatRecommendation
- **Training Phrases**:
  - "Recommend seats"
  - "Best seats for movie"
  - "Where should I sit"
  - "Seat suggestions"
- **Entities**: @movie-name, @theatre-name, @time
- **Response**: Enable webhook call

#### **5. MoodBasedRec Intent**
- **Intent Name**: MoodBasedRec
- **Training Phrases**:
  - "Recommend movies based on mood"
  - "I'm feeling happy, what should I watch"
  - "Sad movies"
  - "Action movies"
- **Entities**: @genre, @mood
- **Response**: Enable webhook call

#### **6. GetShowtimes Intent**
- **Intent Name**: GetShowtimes
- **Training Phrases**:
  - "What time is movie playing"
  - "Showtimes for [movie]"
  - "When is [movie] showing"
- **Entities**: @movie-name, @date, @time
- **Response**: Enable webhook call

#### **7. CheckAvailability Intent**
- **Intent Name**: CheckAvailability
- **Training Phrases**:
  - "Check seat availability"
  - "Are seats available"
  - "Is there space"
- **Response**: Enable webhook call

#### **8. PaymentQuery Intent**
- **Intent Name**: PaymentQuery
- **Training Phrases**:
  - "Payment options"
  - "How to pay"
  - "Payment methods"
- **Response**: Enable webhook call

#### **9. CancelBooking Intent**
- **Intent Name**: CancelBooking
- **Training Phrases**:
  - "Cancel booking"
  - "How to cancel"
  - "Refund policy"
- **Response**: Enable webhook call

### **Configure Entities**

#### **@movie-name Entity**
- **Entity Type**: System Entity - @sys.any
- **Reference**: Movie names from database
- **Examples**: "John Wick", "Avatar", "Inception", etc.

#### **@genre Entity**
- **Entity Type**: Custom Entity
- **Values**:
  - Action, Comedy, Drama, Horror, Romance, Sci-Fi, Thriller, Animation

#### **@mood Entity**
- **Entity Type**: Custom Entity
- **Values**:
  - Happy, Sad, Excited, Relaxed, Adventurous, Romantic

#### **@time Entity**
- **Entity Type**: System Entity - @sys.time
- **Reference**: Showtimes

#### **@date Entity**
- **Entity Type**: System Entity - @sys.date
- **Reference**: Booking dates

#### **@seat-type Entity**
- **Entity Type**: Custom Entity
- **Values**:
  - Premium, Standard, Recliner, VIP

### **Enable Webhook**

1. **Go to Fulfillment** in Dialogflow Console
2. **Enable Webhook**
3. **Webhook URL**: `http://localhost:5000/api/chatbot/webhook`
4. **Save**

## **2. Backend Setup**

### **Install Dependencies**
```bash
cd server
npm install @google-cloud/dialogflow
```

### **Environment Configuration**
Create `.env` file:
```env
DIALOGFLOW_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

### **Service Account Setup**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your Dialogflow project**
3. **Go to IAM & Admin > Service Accounts**
4. **Create Service Account**:
   - Name: "dialogflow-service-account"
   - Role: "Dialogflow API Client"
5. **Create and Download JSON Key**
6. **Save as**: `server/service-account-key.json`

## **3. Frontend Integration Options**

### **Option A: Dialogflow Messenger Widget**

Add to `public/index.html`:
```html
<script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js"></script>

<df-messenger
  intent="WELCOME"
  chat-title="CineAI Assistant"
  agent-id="YOUR_AGENT_ID"
  language-code="en"
  chat-icon="https://img.icons8.com/color/96/cinema.png"
></df-messenger>
```

### **Option B: Custom UI (Recommended)**

Use `EnhancedChatbot.jsx` component:
```jsx
import EnhancedChatbot from './components/EnhancedChatbot';

// In your main component
<EnhancedChatbot />
```

## **4. API Endpoints**

### **Webhook Endpoint**
```
POST /api/chatbot/webhook
```
- **Purpose**: Dialogflow webhook fulfillment
- **Called by**: Dialogflow when intent matched
- **Response**: Dialogflow fulfillment text

### **Direct API Endpoint**
```
POST /api/chatbot/dialogflow
```
- **Purpose**: Direct Dialogflow API calls
- **Called by**: Custom frontend UI
- **Request**: `{ message, sessionId }`
- **Response**: `{ message, intent, confidence }`

## **5. Testing**

### **Test Webhook**
```bash
curl -X POST http://localhost:5000/api/chatbot/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "queryResult": {
      "intent": {"displayName": "Greeting"},
      "parameters": {},
      "fulfillmentText": "Hello!"
    }
  }'
```

### **Test Direct API**
```bash
curl -X POST http://localhost:5000/api/chatbot/dialogflow \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me movies",
    "sessionId": "test_session"
  }'
```

## **6. Deployment Considerations**

### **Production Webhook URL**
- **Development**: `http://localhost:5000/api/chatbot/webhook`
- **Production**: `https://your-domain.com/api/chatbot/webhook`

### **Security**
- **HTTPS required** for production webhooks
- **Authentication** (optional but recommended)
- **Rate limiting** to prevent abuse

### **Environment Variables**
```env
# Production
DIALOGFLOW_PROJECT_ID=prod-project-id
GOOGLE_APPLICATION_CREDENTIALS=./prod-service-account.json
WEBHOOK_URL=https://your-domain.com/api/chatbot/webhook
```

## **7. Monitoring & Debugging**

### **Dialogflow Console**
- **Training Tab**: Review training phrases
- **Intents Tab**: Monitor intent detection
- **Analytics**: Track usage patterns

### **Backend Logs**
```javascript
console.log(`Dialogflow Intent: ${intent}`);
console.log(`Parameters:`, params);
```

### **Frontend Debugging**
- **Browser Console**: Check API calls
- **Network Tab**: Monitor requests
- **Intent Confidence**: Check detection accuracy

## **8. Migration Steps**

### **Phase 1: Parallel Operation**
- Keep existing chatbotService.js
- Add Dialogflow webhook
- Test both systems

### **Phase 2: Gradual Migration**
- Route some users to Dialogflow
- Monitor performance
- Compare accuracy

### **Phase 3: Full Migration**
- Remove old chatbotService.js
- Update all frontend components
- Deploy Dialogflow-only solution

## **9. Benefits Achieved**

### **Improved NLP**
- **Professional intent detection**
- **Entity extraction**
- **Context management**
- **Multilingual support**

### **Better User Experience**
- **Natural conversations**
- **Accurate responses**
- **Faster processing**
- **Consistent behavior**

### **Scalability**
- **Google Cloud infrastructure**
- **Auto-scaling**
- **Global availability**
- **Enterprise reliability**

### **Analytics**
- **Conversation analytics**
- **Intent detection metrics**
- **User behavior insights**
- **Performance monitoring**

## **10. Troubleshooting**

### **Common Issues**

#### **Webhook Not Responding**
- Check server is running
- Verify webhook URL
- Check CORS settings
- Review server logs

#### **Intent Not Detected**
- Add more training phrases
- Check entity definitions
- Review intent conflicts
- Test in Dialogflow console

#### **Service Account Issues**
- Verify JSON key path
- Check permissions
- Ensure correct project ID
- Test API access

#### **Frontend Integration Problems**
- Check API endpoint URLs
- Verify CORS headers
- Review error handling
- Test network requests

### **Debug Commands**
```bash
# Test service account
gcloud auth activate-service-account --key-file=service-account-key.json

# Test Dialogflow API
gcloud dialogflow intents list --project=your-project-id

# Check webhook connectivity
curl -I http://localhost:5000/api/chatbot/webhook
```

## **Result: Professional Chatbot System**

After completing this setup, you'll have:
- **Google Dialogflow** handling NLP
- **Webhook integration** with your backend
- **Custom UI** for better user experience
- **Professional intent detection**
- **Scalable architecture**
- **Analytics and monitoring**

**The custom NLP is replaced with enterprise-grade Dialogflow!**

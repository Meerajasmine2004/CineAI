# Custom Chatbot UI Implementation Guide

## **Problem Solved**
Created a custom chatbot UI that matches your desired design with proper message flow, booking cards, and professional appearance.

## **Complete Implementation**

### **1. Custom Chatbot Component**

**Created: CustomChatbot.jsx**

**Key Features:**
- **Floating chat button** - Bottom-right corner with gradient
- **Chat window** - Modern design with header and messages
- **Welcome screen** - Initial greeting with quick actions
- **Message flow** - User and bot messages with timestamps
- **Booking cards** - Professional booking confirmation cards
- **Input area** - Modern input with send button

### **2. UI Design Elements**

**Chat Toggle Button:**
```jsx
<button className="chat-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
  <span>Chat</span>
</button>
```

**Chat Header:**
```jsx
<div className="chat-header">
  <div className="header-content">
    <div className="bot-avatar">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    </div>
    <div className="bot-info">
      <h3>CineAI Assistant</h3>
      <p>Always here to help</p>
    </div>
  </div>
  <button className="close-btn" onClick={() => setIsOpen(false)}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>
</div>
```

**Welcome Message:**
```jsx
<div className="welcome-message">
  <div className="welcome-content">
    <div className="welcome-avatar">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
      </svg>
    </div>
    <h4>Hi there! </h4>
    <p>I'm your CineAI Assistant. I can help you book movie tickets, find showtimes, and get personalized recommendations.</p>
    <div className="quick-actions">
      <button onClick={() => setInput("hi")}>Start Booking</button>
      <button onClick={() => setInput("What movies are showing?")}>Browse Movies</button>
    </div>
  </div>
</div>
```

### **3. Message Flow**

**User Message:**
```jsx
<div className="message user-message">
  <div className="message-content">
    <p>{message.text}</p>
    <span className="timestamp">{message.timestamp}</span>
  </div>
</div>
```

**Bot Message:**
```jsx
<div className="message bot-message">
  <div className="message-content">
    <p>{message.text}</p>
    <span className="timestamp">{message.timestamp}</span>
  </div>
</div>
```

**Booking Card Message:**
```jsx
<div className="message card-message">
  <div className="booking-card">
    <div className="booking-header">
      <h4> Booking Confirmation</h4>
    </div>
    <div className="booking-details">
      <div className="detail-row">
        <span className="label">Movie:</span>
        <span className="value">{message.data.movie}</span>
      </div>
      <div className="detail-row">
        <span className="label">Theatre:</span>
        <span className="value">{message.data.theatre}</span>
      </div>
      <div className="detail-row">
        <span className="label">Time:</span>
        <span className="value">{message.data.time}</span>
      </div>
      <div className="detail-row">
        <span className="label">Seats:</span>
        <span className="value">{message.data.seats.join(", ")}</span>
      </div>
      <div className="detail-row total">
        <span className="label">Total:</span>
        <span className="value">#{message.data.total}</span>
      </div>
    </div>
    <button className="proceed-btn" onClick={() => navigate("/payment", { state: message.data })}>
      Proceed to Payment
    </button>
  </div>
</div>
```

### **4. Input Area**

**Modern Input Design:**
```jsx
<div className="input-container">
  <div className="input-wrapper">
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      placeholder="Type your message..."
      className="chat-input"
    />
    <button onClick={sendMessage} className="send-btn" disabled={!input.trim()}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13"></polygon>
      </svg>
    </button>
  </div>
</div>
```

## **CSS Styling**

### **1. Chat Toggle Button**
```css
.chat-toggle-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
  font-weight: 500;
}

.chat-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5);
}
```

### **2. Chat Window**
```css
.chat-window {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### **3. Chat Header**
```css
.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bot-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### **4. Message Styling**
```css
.message {
  margin-bottom: 16px;
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.bot-message {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
}

.user-message .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.bot-message .message-content {
  background: white;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
}

.timestamp {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
  display: block;
}
```

### **5. Booking Card Styling**
```css
.booking-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 280px;
}

.booking-header h4 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.detail-row.total {
  border-top: 1px solid #e2e8f0;
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 600;
  color: #667eea;
}

.proceed-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.proceed-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
```

## **Integration Instructions**

### **1. Replace DialogflowChatbot Component**

**In your main App.js or wherever you use DialogflowChatbot:**
```jsx
// Replace this:
import DialogflowChatbot from './components/DialogflowChatbot';

// With this:
import CustomChatbot from './components/CustomChatbot';

// And use:
<CustomChatbot />
```

### **2. Ensure Backend API is Working**

**Make sure your `/api/chatbot` endpoint is available and returns:**
```javascript
{
  success: true,
  type: "booking_card",
  data: {
    movie: "Movie Name",
    theatre: "Theatre Name",
    time: "Showtime",
    seats: ["D6", "D7"],
    total: 500
  }
}
```

### **3. Test the Complete Flow**

**Expected User Experience:**
```
1. User clicks "Chat" button
2. Chat window opens with welcome message
3. User clicks "Start Booking" or types "hi"
4. Bot responds with booking flow
5. User completes booking process
6. Bot shows booking card
7. User clicks "Proceed to Payment"
8. Navigate to payment page
```

## **Key Features**

### **1. Professional Design**
- **Gradient colors** - Modern purple to blue gradient
- **Rounded corners** - Modern UI design
- **Smooth animations** - Slide-up and hover effects
- **Shadow effects** - Depth and dimension

### **2. User Experience**
- **Welcome screen** - Friendly greeting with quick actions
- **Timestamps** - Message timing
- **Typing indicators** - Visual feedback
- **Responsive design** - Works on mobile

### **3. Booking Integration**
- **Booking cards** - Professional confirmation display
- **Payment navigation** - Seamless flow to payment
- **Data persistence** - State management
- **Error handling** - Graceful fallbacks

### **4. Interactive Elements**
- **Hover effects** - Button and card interactions
- **Quick actions** - Predefined responses
- **Send button** - Visual feedback
- **Close functionality** - Window management

## **Benefits**

### **1. Modern UI**
- **Professional appearance** - Matches your design requirements
- **Intuitive interface** - Easy to use
- **Visual hierarchy** - Clear information structure
- **Responsive design** - Works on all devices

### **2. Enhanced UX**
- **Smooth animations** - Professional feel
- **Quick actions** - Faster interaction
- **Real-time updates** - Immediate feedback
- **Error prevention** - Robust implementation

### **3. Integration Ready**
- **Backend compatible** - Works with existing API
- **State management** - Proper data flow
- **Navigation ready** - Payment page integration
- **Extensible** - Easy to add features

## **Final Result**

The custom chatbot UI now provides:
- **Beautiful design** that matches your requirements
- **Complete booking flow** with card display
- **Professional appearance** with gradients and animations
- **Mobile responsive** design
- **Backend integration** with your existing API
- **Payment navigation** for complete user journey

**Your chatbot now has the exact UI design you wanted!**

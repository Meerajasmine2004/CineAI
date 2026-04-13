import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CustomChatbot.css';

const CustomChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId] = useState(() => `user_${Date.now()}`);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      type: "user", 
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await axios.post('/api/chatbot', {
        message: input,
        sessionId: sessionId
      });

      const botMessage = {
        type: "bot",
        text: response.data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (response.data.success) {
        if (response.data.type === "booking_card") {
          setMessages(prev => [
            ...prev,
            botMessage,
            { 
              type: "card", 
              data: response.data.data,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        } else {
          setMessages(prev => [...prev, botMessage]);
        }
      } else {
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          type: "bot",
          text: "Sorry, something went wrong. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const renderBookingCard = (message) => {
    return (
      <div className="booking-card">
        <div className="booking-header">
          <h4>🎬 Booking Confirmation</h4>
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
            <span className="value">₹{message.data.total}</span>
          </div>
        </div>
        <button 
          className="proceed-btn"
          onClick={() => navigate("/payment", { state: message.data })}
        >
          Proceed to Payment
        </button>
      </div>
    );
  };

  const renderMessage = (message, index) => {
    if (message.type === "user") {
      return (
        <div key={index} className="message user-message">
          <div className="message-content">
            <p>{message.text}</p>
            <span className="timestamp">{message.timestamp}</span>
          </div>
        </div>
      );
    } else if (message.type === "bot") {
      return (
        <div key={index} className="message bot-message">
          <div className="message-content">
            <p>{message.text}</p>
            <span className="timestamp">{message.timestamp}</span>
          </div>
        </div>
      );
    } else if (message.type === "card") {
      return (
        <div key={index} className="message card-message">
          {renderBookingCard(message)}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Chat</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
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
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="messages-container">
            {messages.length === 0 && (
              <div className="welcome-message">
                <div className="welcome-content">
                  <div className="welcome-avatar">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                    </svg>
                  </div>
                  <h4>Hi there! 👋</h4>
                  <p>I'm your CineAI Assistant. I can help you book movie tickets, find showtimes, and get personalized recommendations.</p>
                  <div className="quick-actions">
                    <button onClick={() => setInput("hi")}>Start Booking</button>
                    <button onClick={() => setInput("What movies are showing?")}>Browse Movies</button>
                  </div>
                </div>
              </div>
            )}
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>

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
              <button 
                onClick={sendMessage}
                className="send-btn"
                disabled={!input.trim()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomChatbot;

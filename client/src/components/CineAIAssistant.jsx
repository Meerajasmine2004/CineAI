import { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, Maximize2, Bot, User, Calendar, MapPin, Clock, Users, CreditCard, Trash2 } from 'lucide-react';
import api from '../services/api';

const CineAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Generate or retrieve session ID on component mount
  useEffect(() => {
    const existingSessionId = sessionStorage.getItem('cineai_session_id');
    const newSessionId = existingSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!existingSessionId) {
      sessionStorage.setItem('cineai_session_id', newSessionId);
    }
    
    setSessionId(newSessionId);
    
    // Load chat history from localStorage
    loadChatHistory();
    
    // Show popup after 5 seconds if not already shown in this session
    const popupShown = sessionStorage.getItem('chat_popup_shown');
    if (!popupShown) {
      setTimeout(() => {
        setShowPopup(true);
        sessionStorage.setItem('chat_popup_shown', 'true');
      }, 5000);
      
      // Hide popup after 8 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 13000);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('cineai_chat_history');
      if (saved) {
        const historyMessages = JSON.parse(saved);
        // Convert stored messages back to message format
        const formattedMessages = historyMessages.map(msg => ({
          id: msg.id || Date.now(),
          type: msg.sender,
          text: msg.message,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          data: msg.data || null
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Save chat history to localStorage
  const saveChatHistory = (messages) => {
    try {
      const historyMessages = messages.map(msg => {
        const now = msg.timestamp || new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const date = now.toLocaleDateString();
        
        return {
          sender: msg.type,
          message: msg.text,
          time: time,
          date: date,
          data: msg.data || null
        };
      });
      
      // Keep only last 50 messages to avoid localStorage overflow
      const recentMessages = historyMessages.slice(-50);
      localStorage.setItem('cineai_chat_history', JSON.stringify(recentMessages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  useEffect(() => {
    // Auto focus when chatbot opens and is not minimized
    if (isOpen && !isMinimized && inputRef.current) {
      // Small delay to ensure the input is fully rendered
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Additional effect to focus when maximizing from minimized state
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      // Focus when user maximizes from minimized state
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isMinimized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => {
      const updatedMessages = [...prev, userMessage];
      // Save to localStorage
      saveChatHistory(updatedMessages);
      return updatedMessages;
    });
    
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/chatbot', { 
        message: messageToSend,
        sessionId: sessionId 
      });
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.data.message,
        timestamp: new Date(),
        data: response.data.data
      };

      setMessages(prev => {
        const updatedMessages = [...prev, botMessage];
        // Save to localStorage
        saveChatHistory(updatedMessages);
        return updatedMessages;
      });
      
      // Set booking data if available
      if (response.data.data) {
        setBookingData(response.data.data);
      }

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again later! 🤖",
        timestamp: new Date()
      };
      
      setMessages(prev => {
        const updatedMessages = [...prev, errorMessage];
        // Save to localStorage
        saveChatHistory(updatedMessages);
        return updatedMessages;
      });
    } finally {
      setIsLoading(false);
      // Auto-focus the input field after sending message
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProceedToPayment = () => {
    if (bookingData) {
      // Store booking data in sessionStorage for payment page
      sessionStorage.setItem('chatbotBookingData', JSON.stringify(bookingData));
      window.location.href = '/payment';
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
    setShowClearConfirm(false);
  };

  const formatTime = (date) => {
    const validDate = date ? new Date(date) : new Date();
    return validDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    const validDate = date ? new Date(date) : new Date();
    return validDate.toLocaleDateString();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-cinema-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-white z-50"
        >
          <Bot className="w-7 h-7" />
        </button>
      )}

      {/* Floating Popup Message */}
      {showPopup && !isOpen && (
        <div className="fixed bottom-24 right-6 bg-purple-600 text-white px-4 py-3 rounded-lg shadow-2xl z-50 animate-fade-in max-w-sm">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <span className="text-sm font-medium">Need help booking tickets? Try our AI Assistant!</span>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-slate-900 rounded-2xl shadow-2xl z-50 transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-[600px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-red-500 text-white p-4 rounded-t-2xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">CineAI Assistant</h3>
                <p className="text-xs opacity-90">Your movie booking expert 🎬</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="h-[440px] overflow-y-auto p-4 bg-slate-900">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-slate-300">Hello! I'm your CineAI Assistant 🎬</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Ask me about movies, showtimes, or booking!
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.type === 'user' 
                            ? 'bg-cinema-600 text-white order-2' 
                            : 'bg-slate-700 text-white order-1'
                        }`}>
                          {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`${message.type === 'user' ? 'mr-2' : 'ml-2'}`}>
                          <div className={`px-4 py-2 rounded-2xl transition-all duration-300 hover:shadow-lg ${
                            message.type === 'user'
                              ? 'bg-cinema-600 text-white rounded-br-sm hover:bg-cinema-700'
                              : 'bg-slate-800 text-white rounded-bl-sm shadow-lg border border-slate-700 hover:bg-slate-700'
                          }`}>
                            <p className="text-sm whitespace-pre-line">{message.text}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-400">
                              {formatTime(message.timestamp)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Booking Card */}
                      {message.data && (
                        <div className="mt-3 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 rounded-xl p-4 shadow-sm animate-fade-in hover:shadow-lg transition-all duration-300">
                          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-400" />
                            Recommended Booking
                          </h4>
                          
                          <div className="space-y-2">
                            {message.data.movie && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-300">Movie:</span>
                                <span className="text-sm font-medium text-white">{message.data.movie.title}</span>
                              </div>
                            )}
                            
                            {message.data.theatre && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-slate-300">Theatre:</span>
                                <span className="text-sm font-medium text-white">{message.data.theatre}</span>
                              </div>
                            )}
                            
                            {message.data.showTime && (
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-slate-300">Time:</span>
                                <span className="text-sm font-medium text-white">{message.data.showTime}</span>
                              </div>
                            )}
                            
                            {message.data.seats && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-slate-300">Seats:</span>
                                <span className="text-sm font-medium text-white">{message.data.seats.join(', ')}</span>
                              </div>
                            )}
                            
                            {message.data.totalPrice && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-300">Total:</span>
                                <span className="text-sm font-bold text-purple-400">
                                  ₹{message.data.totalPrice.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={handleProceedToPayment}
                            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-cinema-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-cinema-700"
                          >
                            <CreditCard className="w-4 h-4" />
                            Proceed to Payment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start mb-4 animate-fade-in">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="ml-2">
                        <div className="bg-slate-800 text-white rounded-2xl rounded-bl-sm shadow-lg border border-slate-700 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <span className="text-sm text-slate-300 ml-2">CineAI is thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="absolute bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-600 p-4 rounded-b-2xl">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about movies, showtimes, or booking..."
                    className="flex-1 px-4 py-2 bg-slate-900 text-white border border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 text-white p-6 rounded-xl shadow-2xl max-w-sm mx-4 animate-fade-in">
            <h3 className="text-lg font-semibold mb-4">Clear chat history?</h3>
            <p className="text-slate-300 mb-6">This will remove all messages from the chat window. You can continue chatting after clearing.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearChatHistory}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0,
      transform: translateY(10px);
    }
    to {
      opacity: 1,
      transform: translateY(0);
    }
  }
  
  .chat-popup {
    position: fixed;
    bottom: 90px;
    right: 30px;
    background: #1f2937;
    color: white;
    padding: 10px 14px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    z-index: 1000;
    animation: fadeIn 0.3s ease-in-out;
  }
`;

// Inject styles into head
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default CineAIAssistant;

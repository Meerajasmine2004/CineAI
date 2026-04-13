import React, { useEffect, useRef } from 'react';

const DialogflowChatbot = () => {
  const messengerRef = useRef(null);

  useEffect(() => {
    // Load Dialogflow Messenger script
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize messenger when script loads
    script.onload = () => {
      if (window.dfMessenger) {
        window.dfMessenger.addEventListener('df-messenger-loaded', () => {
          console.log('Dialogflow Messenger loaded successfully');
        });
      }
    };

    // Cleanup
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="dialogflow-chatbot">
      <df-messenger
        intent="WELCOME"
        chat-title="CineAI Assistant"
        agent-id="YOUR_AGENT_ID"
        language-code="en"
        chat-icon="https://img.icons8.com/color/96/cinema.png"
      ></df-messenger>
      
      <style jsx>{`
        df-messenger {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
        }
        
        df-messenger df-messenger-chat {
          --df-messenger-bot-message: #1e293b;
          --df-messenger-user-message: #ef4444;
          --df-messenger-font-color: white;
          --df-messenger-font-family: system-ui, -apple-system, sans-serif;
          --df-messenger-chat-background: #0f172a;
          --df-messenger-input-background: #1e293b;
          --df-messenger-input-color: white;
        }
      `}</style>
    </div>
  );
};

export default DialogflowChatbot;

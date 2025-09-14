"use client"
import { useState } from 'react';

function StyledLinkButton({ 
  children, 
  href = "/readpdf", 
  disabled = false, 
  className = "",
  onClick,
  ...props 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!disabled && href) {
      window.location.href = href;
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        px-6 py-3 
        bg-gradient-to-r from-blue-600 to-purple-600 
        hover:from-blue-700 hover:to-purple-700
        text-white font-semibold rounded-lg
        shadow-lg hover:shadow-xl
        transform hover:scale-105 active:scale-95
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-4 focus:ring-blue-300
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        cursor-pointer
        ${className}
      `}
      {...props}
    >
      {children || "Import your medical history"}
    </button>
  );
}

// Simple chatbot placeholder component
function SimpleChatbot({ bpm }) {
  const [messages, setMessages] = useState([
    { text: `Hello! I see your current BPM is ${bpm}. How can I help you today?`, isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, isBot: false };
    const botResponse = { 
      text: `Thanks for your message! Your BPM of ${bpm} looks ${bpm > 100 ? 'a bit elevated' : 'normal'}. How are you feeling?`, 
      isBot: true 
    };
    
    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput('');
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Health Assistant</h3>
      
      <div className="h-64 overflow-y-auto border rounded p-3 mb-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.isBot ? 'text-blue-600' : 'text-gray-800'}`}>
            <strong>{msg.isBot ? 'Bot: ' : 'You: '}</strong>
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your health..."
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  // Later this BPM will come from your Raspberry Pi backend
  const bpm = 110;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">BPM Wellness Monitor</h1>

      <div className="mb-6">
        <StyledLinkButton href="/readpdf">
          Import your medical history
        </StyledLinkButton>
      </div>

      <p className="mb-6 text-lg">
        Current BPM: <span className="font-semibold text-blue-600">{bpm}</span>
      </p>
      
      <SimpleChatbot bpm={bpm} />
    </main>
  );
}
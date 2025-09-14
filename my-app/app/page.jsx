"use client";
import { useState, useEffect, useRef } from "react";

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

function SimpleChatbot({ bpm }) {
  const [messages, setMessages] = useState([
    { text: `Hello! I see your current BPM is ${bpm ?? "loading..."}. How can I help you today?`, isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState(null);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const payload = { message: input };
    if (runId) payload.run_id = runId;

    try {
      const res = await fetch("/api/diagnose", {
        method: runId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to reach backend");
      }

      const data = await res.json();
      setRunId(data.run_id);

      const botMessage = { text: data.response || "Sorry, I didn’t understand that.", isBot: true };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { text: "Error connecting to AI agent.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Health Assistant</h3>

      <div
        ref={chatWindowRef}
        className="h-64 overflow-y-auto border rounded p-3 mb-4 bg-gray-50"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 ${msg.isBot ? "text-blue-600" : "text-gray-800"}`}
          >
            <strong>{msg.isBot ? "Bot: " : "You: "}</strong>
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-blue-400">Bot is typing...</div>}
      </div>

      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your health..."
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={3}
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default function Page() {
  const [bpm, setBpm] = useState(null);

  useEffect(() => {
    const fetchBpm = async () => {
      try {
        const res = await fetch("/api/bpm");
        const data = await res.json();
        setBpm(data.bpm);
      } catch (err) {
        console.error("Failed to fetch BPM", err);
      }
    };

    fetchBpm();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">BPM Wellness Monitor</h1>

      <div className="mb-6">
        <StyledLinkButton href="/readpdf">
          Import your medical history
        </StyledLinkButton>
      </div>

      <p className="mb-6 text-lg">
        Current BPM: <span className="font-semibold text-blue-600">{bpm ?? "Loading..."}</span>
      </p>

      <SimpleChatbot bpm={bpm} />
    </main>
  );
}
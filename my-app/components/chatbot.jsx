"use client";
import { useState, useEffect, useRef } from "react";

export default function Chatbot() {
  const [bpm, setBpm] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [runId, setRunId] = useState(null);
  const [loading, setLoading] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    const fetchBpm = async () => {
      try {
        const res = await fetch("/api/bpm"); // Relative path, proxied to backend
        const data = await res.json();
        setBpm(data.bpm);
      } catch (err) {
        console.error("Error fetching BPM:", err);
      }
    };

    fetchBpm();
    const interval = setInterval(fetchBpm, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll chat window to bottom when messages update
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setLoading(true);

    const payload = { message: input };
    if (runId) payload.run_id = runId;

    try {
      const res = await fetch("/api/diagnose", {
        method: runId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.error) {
        setMessages((msgs) => [
          ...msgs,
          { sender: "bot", text: `Error: ${data.error}` },
        ]);
      } else {
        setRunId(data.run_id);
        setMessages((msgs) => [...msgs, { sender: "bot", text: data.response }]);
      }
    } catch (error) {
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Error communicating with server." },
      ]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-6 flex flex-col items-center max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Health Chatbot</h1>
      <p>Your current BPM: {bpm ?? "Loading..."}</p>
      <div className="mt-2 mb-6 border p-4 rounded-lg w-full text-center bg-white">
        {bpm > 100 ? (
          <p className="text-red-500">⚠️ High heart rate detected!</p>
        ) : bpm < 60 ? (
          <p className="text-yellow-500">⚠️ Low heart rate detected!</p>
        ) : bpm ? (
          <p className="text-green-500">✅ Normal heart rate.</p>
        ) : (
          <p>Waiting for sensor data...</p>
        )}
      </div>

      <div
        ref={chatWindowRef}
        className="chat-window border rounded p-4 w-full h-96 overflow-y-auto mb-4 bg-white"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-2 p-2 rounded ${
              msg.sender === "user" ? "bg-blue-100 text-right" : "bg-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <p>Loading...</p>}
      </div>

      <textarea
        className="w-full border rounded p-2"
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your symptoms or questions here..."
        disabled={loading}
      />
      <button
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={sendMessage}
        disabled={loading || !input.trim()}
      >
        Send
      </button>
    </div>
  );
}
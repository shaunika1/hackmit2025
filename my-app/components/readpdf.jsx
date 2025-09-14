"use client";
import { useState } from "react";

export default function ReadPDFPage() {
  const [file, setFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPdfText("");
      setMessages([]);
      setError("");
    }
  };

  // Upload PDF
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setUploading(true);
    setError("");
    setPdfText("");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to upload PDF.");
        setUploading(false);
        return;
      }

      const data = await res.json();
      setPdfText(data.pdf_text || "No text extracted from PDF.");

      // Initialize chatbot with PDF context
      setMessages([
        {
          text: "Hello! I can answer questions about your uploaded medical history.",
          isBot: true,
        },
        { text: data.pdf_text, isBot: true },
      ]);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error connecting to the server.");
    } finally {
      setUploading(false);
    }
  };

  // Send chat message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botText = data?.response || "Sorry, I couldn't get a response from the AI.";
      setMessages((prev) => [...prev, { text: botText, isBot: true }]);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [...prev, { text: "Error contacting AI agent.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Upload Your Medical History</h1>

      {/* PDF Upload Section */}
<div className="bg-white p-6 rounded shadow-lg w-full max-w-md flex flex-col gap-4 mb-6">
  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition">
    <span className="text-gray-600 text-center">
      Drag or drop files here, or click to upload files
    </span>
    <input
      type="file"
      accept=".pdf"
      onChange={handleFileChange}
      className="hidden"
    />
  </label>

  <button
    onClick={handleUpload}
    disabled={!file || uploading}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
  >
    {uploading ? "Uploading..." : "Upload PDF"}
  </button>
  {error && <p className="text-red-600">{error}</p>}
</div>


      {/* Extracted PDF Text */}
      {pdfText && (
        <div className="bg-white p-4 rounded shadow-lg w-full max-w-md mb-6 max-h-64 overflow-y-auto">
          <h2 className="font-semibold mb-2">Extracted PDF Text:</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{pdfText}</p>
        </div>
      )}

      {/* Chatbot */}
      {pdfText && (
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Health Assistant</h3>

          <div className="h-64 overflow-y-auto border rounded p-3 mb-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-2 ${msg.isBot ? "text-blue-600" : "text-gray-800"}`}
              >
                <strong>{msg.isBot ? "Bot: " : "You: "}</strong>
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-blue-600">Bot is typing...</div>}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your medical history..."
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

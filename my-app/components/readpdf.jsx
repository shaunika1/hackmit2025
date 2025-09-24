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
  const [runId, setRunId] = useState(null);

  const BACKEND_URL = "http://localhost:5000"; // Point explicitly to Flask backend

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPdfText("");
      setMessages([]);
      setError("");
      setRunId(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setUploading(true);
    setError("");
    setPdfText("");
    setMessages([]);
    setRunId(null);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-pdf`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload PDF.");
        setUploading(false);
        return;
      }

      const textPreview = data.extracted_text_preview || "No text extracted from PDF.";
      setPdfText(textPreview);

      // Send extracted text as first message to /api/diagnose
      const chatRes = await fetch(`${BACKEND_URL}/api/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textPreview }),
      });

      if (!chatRes.ok) {
        const chatData = await chatRes.json();
        setError(chatData.error || "Failed to send PDF text to chat.");
        setUploading(false);
        return;
      }

      const chatData = await chatRes.json();

      // Save run_id and initialize chat messages
      setRunId(chatData.run_id);
      setMessages([
        { text: "Hello! I can answer questions about your uploaded medical history.", isBot: true },
        { text: textPreview, isBot: true },
        { text: chatData.response, isBot: true },
      ]);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Error connecting to the server.");
    } finally {
      setUploading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const payload = { message: input };
    if (runId) payload.run_id = runId;

    try {
      const res = await fetch(`${BACKEND_URL}/api/diagnose`, {
        method: runId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [...prev, { text: `Error: ${data.error}`, isBot: true }]);
      } else {
        setRunId(data.run_id);
        setMessages((prev) => [...prev, { text: data.response, isBot: true }]);
      }
    } catch (err) {
      console.error("AI agent error:", err);
      setMessages((prev) => [...prev, { text: "Error contacting AI agent.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Upload Your Medical History</h1>

      {/* Upload Section */}
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

      {/* PDF Preview */}
      {pdfText && (
        <div className="bg-white p-4 rounded shadow-lg w-full max-w-md mb-6 max-h-64 overflow-y-auto">
          <h2 className="font-semibold mb-2">Extracted PDF Text:</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{pdfText}</p>
        </div>
      )}

      {/* Chat Section */}
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
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
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
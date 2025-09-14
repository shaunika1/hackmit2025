"use client"
import { useState, useRef } from "react";

export default function PdfUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const dropRef = useRef();

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setMessage("");
      setAiSummary(""); // Clear previous summary
    } else {
      setMessage("Please select a valid PDF file.");
      setFile(null);
    }
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
    dropRef.current.classList.remove("border-blue-400");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.add("border-blue-400");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current.classList.remove("border-blue-400");
  };

  const handleUpload = async () => {
  if (!file) return;

  setUploading(true);
  const formData = new FormData();
  formData.append("pdf", file);

  try {
    // Make sure this points to your Flask server
    const res = await fetch("http://localhost:5000/api/upload-pdf", {
      method: "POST",
      body: formData,
    });
    
    if (res.ok) {
      const result = await res.json();
      setMessage("Upload successful!");
      
      // Your Flask returns pdf_text, not ai_summary
      if (result.pdf_text) {
        setAiSummary(result.pdf_text);
      }
      
      setFile(null);
    } else {
      const errorData = await res.json();
      setMessage(`Upload failed: ${errorData.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error(err);
    setMessage("Error uploading file. Make sure Flask server is running on port 5000.");
  } finally {
    setUploading(false);
  }

  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border border-gray-300 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload Medical History PDF</h2>

      <div 
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer hover:border-gray-400 transition"
        onClick={() => document.getElementById("pdfInput").click()}
      >
        {file ? (
          <p className="text-gray-700 font-medium">{file.name}</p>
        ) : (
          <p className="text-gray-500">
            Drag & drop a PDF here, or click to select a file
          </p>
        )}
      </div>

      <input
        id="pdfInput"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200 font-medium"
      >
        {uploading ? "Processing..." : "Upload & Analyze"}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {aiSummary && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">AI Analysis Summary:</h3>
          <p className="text-blue-700 leading-relaxed">{aiSummary}</p>
        </div>
      )}
    </div>
  );
}
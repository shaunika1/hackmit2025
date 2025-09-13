import { useState, useRef } from "react";

export default function PdfUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const dropRef = useRef();

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setMessage("");
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
      const res = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("Upload successful!");
        setFile(null);
      } else {
        setMessage("Upload failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border border-gray-300 rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>

      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="mb-4 p-8 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer hover:border-gray-400 transition"
        onClick={() => document.getElementById("pdfInput").click()}
      >
        {file ? (
          <p>{file.name}</p>
        ) : (
          <p>Drag & drop a PDF here, or click to select a file</p>
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
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}

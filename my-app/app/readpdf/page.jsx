// app/readpdf/page.jsx
"use client";
import ReadPDF from "@/components/readpdf";

export default function ReadPdfPage() {
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Upload Your Medical History</h1>
      <ReadPDF />
    </div>
  );
}

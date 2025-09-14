from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import fitz  # PyMuPDF

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def extract_text_from_pdf(filepath):
    doc = fitz.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

@app.route("/api/upload-pdf", methods=["POST"])
def upload_pdf():
    if "pdf" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["pdf"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith(".pdf"):
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        pdf_text = extract_text_from_pdf(filepath)

        return jsonify({"message": "File uploaded successfully", "pdf_text": pdf_text}), 200
    else:
        return jsonify({"error": "Invalid file type"}), 400

if __name__ == "__main__":
    app.run(debug=True)

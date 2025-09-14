from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import fitz  # PyMuPDF
import requests

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Set your Toolhouse API key here or via environment variable
TOOLHOUSE_API_KEY = os.environ.get("TOOLHOUSE_API_KEY") or "YOUR_TOOLHOUSE_API_KEY"

def extract_text_from_pdf(filepath):
    doc = fitz.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# Root route
@app.route("/")
def home():
    return "Flask app is running!"

# Debug route
@app.route("/debug/routes")
def list_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': sorted(rule.methods),
            'url': str(rule)
        })
    return jsonify(routes)

# PDF upload route
@app.route("/api/upload-pdf", methods=["POST"])
def upload_pdf():
    print("upload_pdf function called!")  # Debug print
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

# Toolhouse AI agent route
@app.route("/api/agent", methods=["POST"])
def agent():
    user_input = request.json.get("message")
    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    # Call Toolhouse API
    response = requests.post(
        "https://api.toolhouse.ai/v1/agent/respond",
        headers={
            "Authorization": f"Bearer {TOOLHOUSE_API_KEY}",
            "Content-Type": "application/json"
        },
        json={"message": user_input}
    )

    if response.status_code != 200:
        return jsonify({"error": "Toolhouse API error", "details": response.text}), 500

    data = response.json()
    return jsonify(data)

if __name__ == "__main__":
    print("Starting Flask app...")
    print("Registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.endpoint}: {sorted(rule.methods)} {rule}")
    app.run(debug=True, host='127.0.0.1', port=5000)

from flask import Flask, request, jsonify
from flask_cors import CORS
import os

import fitz  # PyMuPDF
import requests
from bpm_reader import get_bpm  # Your BPM function

app = Flask(__name__)
CORS(app)


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Toolhouse API credentials
TOOLHOUSE_API_KEY = "th-4ljWWSayjDvmgVQVOpkaC_4dX_9mSk_HcOhXvymdGvs"
TOOLHOUSE_AGENT_ID = "0174f557-96ff-4b58-b8fe-9beee93670e0"
TOOLHOUSE_AGENT_URL = f"https://agents.toolhouse.ai/{TOOLHOUSE_AGENT_ID}"


# --------- Utility functions ---------
def extract_text_from_pdf(filepath):
    """Extract text from PDF using PyMuPDF."""
    doc = fitz.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text()
    return text


# --------- Routes ---------
@app.route("/api/bpm", methods=["GET"])
def get_bpm_route():
    bpm = get_bpm()
    return jsonify({"bpm": bpm})



@app.route("/api/upload-pdf", methods=["POST"])
def upload_pdf():
    if "pdf" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["pdf"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.lower().endswith(".pdf"):
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)
        extracted_text = extract_text_from_pdf(filepath)
        return jsonify({
            "message": "File uploaded successfully",
            "extracted_text_preview": extracted_text[:500]
        }), 200
    else:
        return jsonify({"error": "Invalid file type"}), 400



@app.route("/api/diagnose", methods=["POST", "PUT"])
def diagnose():
    # Validate JSON input
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json(silent=True)
    if data is None:
        return jsonify({"error": "Invalid JSON"}), 400

    message = data.get("message")
    run_id = data.get("run_id")  # Only for PUT

    if not message:
        return jsonify({"error": "No message provided"}), 400

    # Add BPM context
    bpm = get_bpm()
    prompt = f"A patient has a BPM of {bpm}. {message}"

    headers = {
        "Authorization": f"Bearer {TOOLHOUSE_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        if request.method == "PUT":
            if not run_id:
                return jsonify({"error": "run_id is required for PUT"}), 400
            url = f"{TOOLHOUSE_AGENT_URL}/{run_id}"
            resp = requests.put(url, headers=headers, json={"message": prompt})
        else:  # POST
            url = TOOLHOUSE_AGENT_URL
            resp = requests.post(url, headers=headers, json={"message": prompt})

        # Debugging logs
        print(f"Toolhouse URL: {url}")
        print(f"Status: {resp.status_code}")
        print(f"Raw response (first 500 chars): {resp.text[:500]}")

        resp.raise_for_status()

        new_run_id = resp.headers.get("X-Toolhouse-Run-ID")

        # Handle JSON or plain text responses
        try:
            result = resp.json()
            diagnosis = (
                result.get("output")
                or result.get("choices", [{}])[0].get("message", {}).get("content")
                or str(result)
            )
        except ValueError:
            # Not JSON → plain text
            diagnosis = resp.text.strip()

        return jsonify({
            "run_id": new_run_id,
            "response": diagnosis
        }), 200

    except requests.exceptions.HTTPError as http_err:
        return jsonify({
            "error": f"HTTP error from Toolhouse: {str(http_err)}",
            "status_code": resp.status_code,
            "raw_response": resp.text
        }), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


# --------- Main ---------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

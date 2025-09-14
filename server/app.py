from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import fitz  # PyMuPDF
import requests
from bpm_reader import get_bpm  # Import your BPM function

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Toolhouse API key and agent ID (hardcoded here; replace with your actual values)
TOOLHOUSE_API_KEY = "th-4ljWWSayjDvmgVQVOpkaC_4dX_9mSk_HcOhXvymdGvs"
TOOLHOUSE_AGENT_ID = "0174f557-96ff-4b58-b8fe-9beee93670e0"

def extract_text_from_pdf(filepath):
    doc = fitz.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

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

    if file and file.filename.endswith(".pdf"):
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        extracted_text = extract_text_from_pdf(filepath)

        return jsonify({
            "message": "File uploaded successfully",
            "extracted_text_preview": extracted_text[:500]  # Return first 500 chars as preview
        }), 200
    else:
        return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/diagnose', methods=['POST', 'PUT'])
def diagnose():
    # Validate JSON content type
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    # Parse JSON safely
    data = request.get_json(silent=True)
    if data is None:
        return jsonify({'error': 'Invalid JSON'}), 400

    message = data.get('message')
    run_id = data.get('run_id')  # Required for PUT requests

    if not message:
        return jsonify({'error': 'No message provided'}), 400

    bpm = get_bpm()
    prompt = f"A patient has a BPM of {bpm}. {message}"

    headers = {
        "Authorization": f"Bearer {TOOLHOUSE_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        if request.method == 'PUT':
            if not run_id:
                return jsonify({'error': 'run_id is required for PUT requests'}), 400
            url = f"https://agents.toolhouse.ai/{TOOLHOUSE_AGENT_ID}/{run_id}"
            response = requests.put(
                url,
                json={"message": prompt},
                headers=headers
            )
        else:  # POST request to start new conversation
            url = f"https://agents.toolhouse.ai/{TOOLHOUSE_AGENT_ID}"
            response = requests.post(
                url,
                json={"message": prompt},
                headers=headers
            )

        response.raise_for_status()

        new_run_id = response.headers.get('X-Toolhouse-Run-ID')
        result = response.json()
        diagnosis = result.get('output') or result.get('choices', [{}])[0].get('message', {}).get('content', 'No response.')

        return jsonify({
            'run_id': new_run_id,
            'response': diagnosis
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
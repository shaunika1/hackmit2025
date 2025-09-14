from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Mock get_bpm function (replace with your real implementation)
def get_bpm():
    return 72  # Mock BPM value

# Your Toolhouse agent endpoint
TOOLHOUSE_API_URL = "https://agents.toolhouse.ai/0174f557-96ff-4b58-b8fe-9beee93670e0"

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
        return jsonify({"message": "File uploaded successfully"}), 200
    else:
        return jsonify({"error": "Invalid file type"}), 400

@app.route('/api/diagnose', methods=['POST', 'PUT'])
def diagnose():
    data = request.json
    message = data.get('message')
    run_id = data.get('run_id')  # Required for PUT requests

    if not message:
        return jsonify({'error': 'No message provided'}), 400

    bpm = get_bpm()
    prompt = f"A patient has a BPM of {bpm}. {message}"

    try:
        if request.method == 'PUT':
            if not run_id:
                return jsonify({'error': 'run_id is required for PUT requests'}), 400
            url = f"{TOOLHOUSE_API_URL}/{run_id}"
            response = requests.put(
                url,
                json={"message": prompt},
                headers={"Content-Type": "application/json"}
            )
        else:  # POST request to start new conversation
            response = requests.post(
                TOOLHOUSE_API_URL,
                json={"message": prompt},
                headers={"Content-Type": "application/json"}
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
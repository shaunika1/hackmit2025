from flask import Flask, jsonify
import random

app = Flask(__name__)

@app.route("/bpm", methods=["GET"])
def get_bpm():
    # Replace this with your actual sensor reading
    bpm = random.randint(60, 100)
    return jsonify({"bpm": bpm})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

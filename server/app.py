from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQAlchemy

import os

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config[""]
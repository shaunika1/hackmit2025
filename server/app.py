from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})


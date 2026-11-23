from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/ping')
def ping():
    return jsonify({'pong': True, 'env': 'cloud-staging'})

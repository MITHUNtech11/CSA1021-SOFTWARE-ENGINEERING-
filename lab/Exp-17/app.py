from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'HEALTHY',
        'service': 'flask-order-api',
        'version': '1.0.0',
        'environment': 'kubernetes-cluster'
    }), 200

@app.route('/api/v1/orders', methods=['GET'])
def get_orders():
    return jsonify([
        {'order_id': 'ORD-101', 'item': 'Wireless Headphone', 'amount': 2499.0, 'status': 'Delivered'},
        {'order_id': 'ORD-102', 'item': 'Ergonomic Keyboard', 'amount': 3899.0, 'status': 'Shipped'}
    ]), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

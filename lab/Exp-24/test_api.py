from app import app

def test_ping():
    client = app.test_client()
    res = client.get('/api/ping')
    assert res.status_code == 200
    assert res.json['pong'] is True

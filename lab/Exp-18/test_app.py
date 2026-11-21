from app import compute_tax, compute_total

def test_compute_tax():
    assert compute_tax(100.0) == 18.0
    assert compute_tax(200.0, 0.12) == 24.0

def test_compute_total():
    assert compute_total(100.0, 18.0) == 118.0

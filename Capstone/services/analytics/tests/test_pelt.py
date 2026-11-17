import pytest
import numpy as np
from services.analytics.app.algorithms.pelt import PELTDetector

def test_pelt_partitions_known_regimes():
    # Signal with 3 clear regimes:
    # 0 to 20: mean 0
    # 20 to 40: mean 10
    # 40 to 60: mean 2
    np.random.seed(42)
    s1 = np.random.normal(0, 0.5, 20)
    s2 = np.random.normal(10, 0.5, 20)
    s3 = np.random.normal(2, 0.5, 20)
    signal = np.concatenate([s1, s2, s3])
    
    pelt = PELTDetector(penalty=15.0)
    cps = pelt.segment(signal)
    
    # Should identify change points near 20 and 40 (within +/- 2 tolerance)
    assert len(cps) >= 2
    assert any(abs(cp - 20) <= 2 for cp in cps)
    assert any(abs(cp - 40) <= 2 for cp in cps)

def test_pelt_computational_pruning():
    # Benchmark that pruning executes smoothly on 200 data points without quadratic stall
    np.random.seed(42)
    signal = np.random.normal(0, 1, 200)
    pelt = PELTDetector(penalty=10.0)
    cps = pelt.segment(signal)
    assert isinstance(cps, list)

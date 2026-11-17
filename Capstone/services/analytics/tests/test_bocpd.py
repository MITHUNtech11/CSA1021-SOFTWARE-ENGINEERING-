import pytest
import numpy as np
from services.analytics.app.algorithms.bocpd import BayesianOnlineCPD

def test_bocpd_run_length_reset():
    # BOCPD on a series that shifts abruptly at index 25
    np.random.seed(42)
    s1 = np.random.normal(0, 0.2, 25)
    s2 = np.random.normal(5, 0.2, 25)
    signal = np.concatenate([s1, s2])

    detector = BayesianOnlineCPD(hazard_rate=50.0)
    change_points = []
    
    for t, val in enumerate(signal):
        is_cp, prob = detector.update(val)
        if is_cp:
            change_points.append((t, prob))
            
    assert len(change_points) >= 1
    # Change point should be detected very close to t=25
    assert any(24 <= cp[0] <= 27 for cp in change_points)

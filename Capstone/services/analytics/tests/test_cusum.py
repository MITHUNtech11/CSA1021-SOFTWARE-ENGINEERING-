import pytest
import numpy as np
from services.analytics.app.algorithms.cusum import TwoSidedCUSUM
from shared.models.change_point import ChangePointType

def test_cusum_zero_alarms_on_stationary_noise():
    # 200 ticks of steady state Gaussian noise with mean 0, std 1
    np.random.seed(42)
    noise = np.random.normal(0, 1, 200)
    cusum = TwoSidedCUSUM(metric_name="gold_diff", allowance_k=0.5, threshold_h=5.0)
    
    alarms = []
    for seq, val in enumerate(noise):
        alarm = cusum.update(seq=seq, game_time_seconds=float(seq*60), value=val)
        if alarm:
            alarms.append(alarm)
    
    # Should produce 0 false alarms on standard noise with h=5.0
    assert len(alarms) == 0

def test_cusum_detects_positive_step_shift():
    # 50 ticks of baseline, then sudden sharp step shift of +4.0 standard deviations
    np.random.seed(42)
    series = list(np.random.normal(0, 0.5, 30)) + list(np.random.normal(4.0, 0.5, 30))
    cusum = TwoSidedCUSUM(metric_name="gold_diff", allowance_k=0.5, threshold_h=4.0)
    
    detected_at = []
    for seq, val in enumerate(series):
        alarm = cusum.update(seq=seq, game_time_seconds=float(seq*60), value=val)
        if alarm:
            detected_at.append((seq, alarm))
    
    assert len(detected_at) >= 1
    first_seq, first_alarm = detected_at[0]
    # The shift happened at index 30, it should be detected within 2 ticks (30, 31, or 32)
    assert 30 <= first_seq <= 32
    assert first_alarm.change_type == ChangePointType.CUSUM_MOMENTUM_SURGE

def test_cusum_detects_negative_step_shift():
    # 30 ticks of baseline, then sudden drop of -4.0 standard deviations (e.g. collapse/comeback)
    np.random.seed(42)
    series = list(np.random.normal(0, 0.5, 30)) + list(np.random.normal(-4.0, 0.5, 30))
    cusum = TwoSidedCUSUM(metric_name="gold_diff", allowance_k=0.5, threshold_h=4.0)
    
    detected_at = []
    for seq, val in enumerate(series):
        alarm = cusum.update(seq=seq, game_time_seconds=float(seq*60), value=val)
        if alarm:
            detected_at.append((seq, alarm))
    
    assert len(detected_at) >= 1
    first_seq, first_alarm = detected_at[0]
    assert 30 <= first_seq <= 32
    assert first_alarm.change_type == ChangePointType.CUSUM_MOMENTUM_COLLAPSE

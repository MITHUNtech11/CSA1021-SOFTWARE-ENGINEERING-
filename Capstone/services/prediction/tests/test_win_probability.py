import pytest
from services.prediction.app.model.win_probability import CalibratedWinProbabilityModel
from shared.models.telemetry import TelemetryTick, TeamState

@pytest.fixture
def model():
    return CalibratedWinProbabilityModel()

def test_win_probability_symmetry_at_baseline(model):
    blue = TeamState(team_name="T1", total_gold=10000, total_kills=2, total_deaths=2, turrets_destroyed=0, dragons=0, barons=0)
    red = TeamState(team_name="WBG", total_gold=10000, total_kills=2, total_deaths=2, turrets_destroyed=0, dragons=0, barons=0)
    tick = TelemetryTick(match_id="M1", sequence_id=5, game_time_seconds=300.0, blue_team=blue, red_team=red)
    
    p_blue, p_red = model.predict(tick=tick, momentum=0.0)
    assert pytest.approx(p_blue, 0.01) == 0.50
    assert pytest.approx(p_red, 0.01) == 0.50
    assert pytest.approx(p_blue + p_red, 0.001) == 1.0

def test_win_probability_extreme_lead_asymptote(model):
    # Blue has massive 12,000 gold lead, 15 kills, 5 turrets, 1 baron
    blue = TeamState(team_name="T1", total_gold=45000, total_kills=18, total_deaths=3, turrets_destroyed=6, dragons=3, barons=1)
    red = TeamState(team_name="WBG", total_gold=33000, total_kills=3, total_deaths=18, turrets_destroyed=0, dragons=0, barons=0)
    tick = TelemetryTick(match_id="M1", sequence_id=20, game_time_seconds=1200.0, blue_team=blue, red_team=red)
    
    p_blue, p_red = model.predict(tick=tick, momentum=0.8)
    assert p_blue > 0.90
    assert p_red < 0.10
    assert 0.0 < p_blue < 1.0

def test_win_probability_time_amplification(model):
    # A 2,000 gold lead in minute 5 vs minute 35
    early_blue = TeamState(team_name="T1", total_gold=8000, total_kills=2, total_deaths=0)
    early_red = TeamState(team_name="WBG", total_gold=6000, total_kills=0, total_deaths=2)
    early_tick = TelemetryTick(match_id="M1", sequence_id=5, game_time_seconds=300.0, blue_team=early_blue, red_team=early_red)
    
    late_blue = TeamState(team_name="T1", total_gold=52000, total_kills=15, total_deaths=13)
    late_red = TeamState(team_name="WBG", total_gold=50000, total_kills=13, total_deaths=15)
    late_tick = TelemetryTick(match_id="M1", sequence_id=35, game_time_seconds=2100.0, blue_team=late_blue, red_team=late_red)
    
    p_early, _ = model.predict(tick=early_tick, momentum=0.0)
    p_late, _ = model.predict(tick=late_tick, momentum=0.0)
    # A 2,000 gold lead in early game represents ~33% more wealth, so early advantage has strong impact
    assert p_early > 0.60
    assert 0.0 < p_late < 1.0

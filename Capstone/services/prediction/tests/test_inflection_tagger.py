import pytest
from services.prediction.app.model.inflection_tagger import InflectionClassifier
from shared.models.change_point import ChangePointRecord, ChangePointType
from shared.models.prediction import InflectionCategory
from shared.models.telemetry import TelemetryTick, TeamState

@pytest.fixture
def classifier():
    return InflectionClassifier()

def test_classify_snowball_acceleration(classifier):
    blue = TeamState(team_name="T1", total_gold=30000, total_kills=12, total_deaths=4, turrets_destroyed=4, dragons=2, barons=0)
    red = TeamState(team_name="WBG", total_gold=25000, total_kills=4, total_deaths=12, turrets_destroyed=1, dragons=1, barons=0)
    tick = TelemetryTick(match_id="M1", sequence_id=15, game_time_seconds=900.0, blue_team=blue, red_team=red)
    
    cp = ChangePointRecord(
        match_id="M1", tick_sequence=15, game_time_seconds=900.0,
        algorithm="CUSUM", change_type=ChangePointType.CUSUM_MOMENTUM_SURGE,
        metric_name="gold_diff", score=4.5, confidence=0.92
    )
    
    # Previous win probability 0.65, now jumps to 0.78
    tag, tpis, is_inflection, explanation = classifier.evaluate(
        tick=tick, change_point=cp, prev_prob=0.65, curr_prob=0.78
    )
    
    assert is_inflection is True
    assert tag == InflectionCategory.SNOWBALL_ACCELERATION
    assert tpis > 0.15
    assert len(explanation) > 10

def test_classify_decisive_comeback(classifier):
    blue = TeamState(team_name="T1", total_gold=28000, total_kills=10, total_deaths=8, turrets_destroyed=2, dragons=1, barons=1)
    red = TeamState(team_name="WBG", total_gold=29000, total_kills=8, total_deaths=10, turrets_destroyed=3, dragons=2, barons=0)
    tick = TelemetryTick(match_id="M1", sequence_id=18, game_time_seconds=1080.0, blue_team=blue, red_team=red)
    
    cp = ChangePointRecord(
        match_id="M1", tick_sequence=18, game_time_seconds=1080.0,
        algorithm="CUSUM", change_type=ChangePointType.CUSUM_MOMENTUM_SURGE,
        metric_name="gold_diff", score=5.2, confidence=0.95
    )
    
    # Blue was losing at 0.38 probability, now swings to 0.58 after Baron steal
    tag, tpis, is_inflection, explanation = classifier.evaluate(
        tick=tick, change_point=cp, prev_prob=0.38, curr_prob=0.58
    )
    
    assert is_inflection is True
    assert tag == InflectionCategory.DECISIVE_COMEBACK
    assert tpis > 0.20

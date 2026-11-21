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

def test_classify_objective_steal_swing_only_on_differential_transition(classifier):
    # Tick 1: Baron diff is 0
    blue1 = TeamState(team_name="SEN", total_gold=25000, total_kills=5, total_deaths=5, turrets_destroyed=2, dragons=0, barons=0)
    red1 = TeamState(team_name="FNC", total_gold=25000, total_kills=5, total_deaths=5, turrets_destroyed=2, dragons=0, barons=0)
    tick1 = TelemetryTick(match_id="M1", sequence_id=10, game_time_seconds=600.0, blue_team=blue1, red_team=red1)
    classifier.evaluate(tick=tick1, change_point=None, prev_prob=0.50, curr_prob=0.50)

    # Tick 2: SEN secures baron/clutch (baron_diff 0 -> 1)
    blue2 = TeamState(team_name="SEN", total_gold=27000, total_kills=8, total_deaths=5, turrets_destroyed=2, dragons=0, barons=1)
    red2 = TeamState(team_name="FNC", total_gold=25000, total_kills=5, total_deaths=8, turrets_destroyed=2, dragons=0, barons=0)
    tick2 = TelemetryTick(match_id="M1", sequence_id=11, game_time_seconds=660.0, blue_team=blue2, red_team=red2)
    tag, tpis, is_inflection, explanation = classifier.evaluate(
        tick=tick2, change_point=None, prev_prob=0.50, curr_prob=0.64
    )
    assert is_inflection is True
    assert tag == InflectionCategory.OBJECTIVE_STEAL_SWING

    # Tick 3: Baron diff remains 1 (no new baron secured) -> should NOT trigger OBJECTIVE_STEAL_SWING again
    blue3 = TeamState(team_name="SEN", total_gold=28000, total_kills=8, total_deaths=5, turrets_destroyed=2, dragons=0, barons=1)
    red3 = TeamState(team_name="FNC", total_gold=26000, total_kills=5, total_deaths=8, turrets_destroyed=2, dragons=0, barons=0)
    tick3 = TelemetryTick(match_id="M1", sequence_id=12, game_time_seconds=720.0, blue_team=blue3, red_team=red3)
    tag3, _, is_inflection3, _ = classifier.evaluate(
        tick=tick3, change_point=None, prev_prob=0.64, curr_prob=0.65
    )
    assert tag3 != InflectionCategory.OBJECTIVE_STEAL_SWING

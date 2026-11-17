import pytest
from datetime import datetime
from pydantic import ValidationError
from shared.models.telemetry import TeamState, TelemetryTick
from shared.models.change_point import ChangePointRecord, ChangePointType
from shared.models.prediction import PredictionRecord, InflectionCategory

def test_team_state_valid():
    state = TeamState(
        team_name="T1",
        total_gold=15200,
        total_kills=5,
        total_deaths=2,
        turrets_destroyed=1,
        dragons=1,
        barons=0,
        vision_score=34.5
    )
    assert state.team_name == "T1"
    assert state.total_gold == 15200
    assert state.turrets_destroyed == 1

def test_team_state_negative_gold_rejected():
    with pytest.raises(ValidationError):
        TeamState(
            team_name="T1",
            total_gold=-500,
            total_kills=0,
            total_deaths=0,
            turrets_destroyed=0,
            dragons=0,
            barons=0,
            vision_score=0.0
        )

def test_telemetry_tick_derived_differentials():
    blue = TeamState(
        team_name="T1",
        total_gold=18000,
        total_kills=8,
        total_deaths=3,
        turrets_destroyed=2,
        dragons=1,
        barons=0,
        vision_score=40.0
    )
    red = TeamState(
        team_name="WBG",
        total_gold=16000,
        total_kills=3,
        total_deaths=8,
        turrets_destroyed=0,
        dragons=0,
        barons=0,
        vision_score=32.0
    )
    tick = TelemetryTick(
        match_id="MATCH-2023-WORLDS-FINALS",
        sequence_id=12,
        game_time_seconds=720.0,
        blue_team=blue,
        red_team=red
    )
    assert tick.gold_diff == 2000
    assert tick.kill_diff == 5
    assert tick.turret_diff == 2
    assert tick.dragon_diff == 1
    assert tick.baron_diff == 0

def test_change_point_record_valid():
    cp = ChangePointRecord(
        match_id="MATCH-001",
        tick_sequence=15,
        game_time_seconds=900.0,
        algorithm="CUSUM",
        change_type=ChangePointType.CUSUM_MOMENTUM_SURGE,
        metric_name="gold_diff",
        score=4.82,
        confidence=0.96,
        details={"cusum_plus": 4.82, "threshold": 4.0}
    )
    assert cp.confidence == 0.96
    assert cp.change_type == ChangePointType.CUSUM_MOMENTUM_SURGE

def test_change_point_record_confidence_bounds():
    with pytest.raises(ValidationError):
        ChangePointRecord(
            match_id="MATCH-001",
            tick_sequence=15,
            game_time_seconds=900.0,
            algorithm="CUSUM",
            change_type=ChangePointType.CUSUM_MOMENTUM_SURGE,
            metric_name="gold_diff",
            score=4.82,
            confidence=1.5,  # Invalid: > 1.0
            details={}
        )

def test_prediction_record_valid():
    pred = PredictionRecord(
        match_id="MATCH-001",
        tick_sequence=18,
        game_time_seconds=1080.0,
        win_probability_blue=0.74,
        win_probability_red=0.26,
        momentum_score=0.62,
        is_inflection_point=True,
        turning_point_impact_score=0.24,
        inflection_category=InflectionCategory.SNOWBALL_ACCELERATION,
        explanation="T1 expanded gold lead by 2,400 after 3-man dive."
    )
    assert pytest.approx(pred.win_probability_blue + pred.win_probability_red, 0.001) == 1.0
    assert pred.is_inflection_point is True
    assert pred.inflection_category == InflectionCategory.SNOWBALL_ACCELERATION

def test_prediction_record_probability_bounds():
    with pytest.raises(ValidationError):
        PredictionRecord(
            match_id="MATCH-001",
            tick_sequence=18,
            game_time_seconds=1080.0,
            win_probability_blue=1.2, # Invalid
            win_probability_red=-0.2, # Invalid
            momentum_score=0.0,
            is_inflection_point=False,
            turning_point_impact_score=0.0,
            explanation="Invalid test"
        )

import pytest
from services.prediction.app.model.valorant_model import (
    ValorantTacticalWinProbability,
    ValorantInflectionTagger,
    ValorantInflectionType
)
from services.analytics.app.vision.hud_analyzer import ValorantHUDState

@pytest.fixture
def model():
    return ValorantTacticalWinProbability()

@pytest.fixture
def tagger():
    return ValorantInflectionTagger()

def test_valorant_model_5v5_symmetry_at_baseline(model):
    state = ValorantHUDState(alive_blue=5, alive_red=5, spike_planted=False, blue_score=0, red_score=0)
    p_blue_rnd, p_red_rnd, p_blue_match, p_red_match = model.predict(state)
    
    assert pytest.approx(p_blue_rnd, 0.02) == 0.50
    assert pytest.approx(p_red_rnd, 0.02) == 0.50
    assert pytest.approx(p_blue_match, 0.02) == 0.50

def test_valorant_model_man_advantage_shifts_odds(model):
    # 5v3 advantage for Blue
    state = ValorantHUDState(alive_blue=5, alive_red=3, spike_planted=False, blue_score=5, red_score=5)
    p_blue, p_red, _, _ = model.predict(state)
    
    assert p_blue >= 0.75
    assert p_red <= 0.25

def test_valorant_model_spike_plant_shifts_to_attackers(model):
    # Even 3v3, but Red planted Spike
    state_no_spike = ValorantHUDState(alive_blue=3, alive_red=3, spike_planted=False, blue_score=4, red_score=4)
    state_with_spike = ValorantHUDState(alive_blue=3, alive_red=3, spike_planted=True, blue_score=4, red_score=4)
    
    p_blue_before, _, _, _ = model.predict(state_no_spike)
    p_blue_after, _, _, _ = model.predict(state_with_spike)
    
    # Spike plant should noticeably decrease Blue defender odds
    assert p_blue_after < p_blue_before - 0.15

def test_valorant_tagger_detects_opening_pick(tagger):
    prev_state = ValorantHUDState(alive_blue=5, alive_red=5, spike_planted=False)
    curr_state = ValorantHUDState(alive_blue=5, alive_red=4, spike_planted=False)
    
    events = tagger.evaluate_transition(prev_state, curr_state, p_blue_prev=0.50, p_blue_curr=0.68)
    assert len(events) >= 1
    assert any(e.inflection_type == ValorantInflectionType.OPENING_PICK for e in events)

def test_valorant_tagger_detects_clutch_situation(tagger):
    prev_state = ValorantHUDState(alive_blue=2, alive_red=3, spike_planted=True)
    curr_state = ValorantHUDState(alive_blue=1, alive_red=3, spike_planted=True)
    
    events = tagger.evaluate_transition(prev_state, curr_state, p_blue_prev=0.35, p_blue_curr=0.12)
    assert any(e.inflection_type == ValorantInflectionType.CLUTCH_IN_PROGRESS for e in events)

def test_valorant_tagger_detects_spike_plant_event(tagger):
    prev_state = ValorantHUDState(alive_blue=4, alive_red=4, spike_planted=False)
    curr_state = ValorantHUDState(alive_blue=4, alive_red=4, spike_planted=True)
    
    events = tagger.evaluate_transition(prev_state, curr_state, p_blue_prev=0.50, p_blue_curr=0.32)
    assert any(e.inflection_type == ValorantInflectionType.SPIKE_PLANTED for e in events)
